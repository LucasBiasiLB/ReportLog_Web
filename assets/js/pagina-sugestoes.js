import { buscarSugestoes, publicarSugestao, excluirSugestao, alternarCurtida } from "./banco.js";

await sessaoPronta;   // garante que usuarioAtual já existe antes de desenhar os cards

const lista = document.getElementById("lista-sugestoes");   // só o contêiner dos cards
const contador = document.getElementById("contador");
const formulario = document.getElementById("form-sugestao");

// Ações que os cards chamam quando o usuário clica nos botões
const acoes = {
    async aoCurtir(id) {
        try {
            await alternarCurtida(id);   // servidor já inverte curtidas/curtiuEu
        } catch (e) {
            alert(e.message);
        }
        await desenharLista();
    },
    async aoExcluir(id) {
        if (!confirm("Excluir esta sugestão?")) return;
        try {
            await excluirSugestao(id);
        } catch (e) {
            alert(e.message);
        }
        await desenharLista();
    }
};

// Limpa a lista e desenha um card para cada sugestão
async function desenharLista() {
    const todas = await buscarSugestoes();
    lista.replaceChildren();                       // apaga os cards antigos
    todas.forEach((s) => lista.append(CartaoSugestao(s, acoes)));

    // Mensagem quando não há nenhuma
    if (todas.length === 0) {
        lista.append(el("p", "vazio", "Ainda não há sugestões. Seja o primeiro!"));
    }
    contador.textContent = todas.length + (todas.length === 1 ? " publicação" : " publicações");
}

// Formulário "Nova sugestão"
formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();                       // não recarrega a página
    const f = new FormData(formulario);
    const titulo = f.get("titulo").trim();
    const descricao = f.get("descricao").trim();
    if (!titulo || !descricao) return;             // campos vazios: ignora

    const rotulos = { jogabilidade: "Jogabilidade", personagens: "Personagens",
                    interface: "Interface", graficos: "Gráficos", outros: "Outros" };

    try {
        await publicarSugestao({
            titulo,
            descricao,
            categoria: rotulos[f.get("categoria")],
            icon: ["atck", "def", "mov", "mp", "set"][Number(f.get("icone")) - 1] || "logo"
        });
    } catch (e) {
        alert(e.message);
        return;
    }

    formulario.reset();
    formulario.querySelectorAll(".campo small").forEach((s) => {
        s.textContent = "0/" + s.textContent.split("/")[1];   // zera os contadores
    });
    await desenharLista();
});

desenharLista();
