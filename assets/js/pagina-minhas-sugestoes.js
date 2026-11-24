import { buscarSugestoesBruto, normalizarSugestoes, excluirSugestao, editarSugestao } from "./banco.js";

await sessaoPronta;   // garante que usuarioAtual já existe antes de desenhar os cards

const lista = document.getElementById("lista-sugestoes");   // só o contêiner dos cards
const contador = document.getElementById("contador");

let todasSugestoes = [];   // todas as sugestões já normalizadas (de todos os usuários)

// Mesmos rótulos do formulário de sugestão (categoria é salva com o nome bonito)
const ROTULOS = {
    jogabilidade: "Jogabilidade",
    personagens:  "Personagens",
    interface:    "Interface",
    graficos:     "Gráficos",
    bugs:         "BUGs",
    outros:       "Outros"
};
// Mesma ordem dos radios de ícone do formulário (1..7)
const ICONE_ORDEM = ["atck", "def", "mov", "mp", "set", "bug", "outros"];

// Só as do usuário logado (admin vê também as dos outros? por enquanto: só as próprias)
function minhasSugestoes() {
    return todasSugestoes.filter((s) => s.uid === usuarioAtual.id);
}

/* ---------- AÇÕES DOS CARDS ---------- */

const acoes = {
    aoAbrir(dados) {
        // leva para a tela de Sugestões, já apontando para esta sugestão
        location.href = "sugestoes.html#" + dados.id;
    },
    async aoExcluir(id) {
        if (!confirm("Excluir esta sugestão?")) return;
        try {
            await excluirSugestao(id);
        } catch (e) {
            alert(e.message);
            return;
        }
        await recarregar();
    },
    aoEditar(dados) {
        abrirEdicao(dados);
    }
};

// Desenha uma linha para cada sugestão (da mais nova para a mais antiga)
function mostrarSugestoes() {
    const minhas = minhasSugestoes();
    lista.replaceChildren();
    minhas.forEach((s) => lista.append(CartaoSugestaoLinha(s, acoes)));

    if (minhas.length === 0) {
        lista.append(el("p", "vazio", "Você ainda não fez nenhuma sugestão."));
    }
    contador.textContent = minhas.length + (minhas.length === 1 ? " enviada" : " enviadas");
}

// Recebe os dados crus (do cache ou do servidor) e desenha
function mostrarBruto(crus) {
    todasSugestoes = normalizarSugestoes(crus);
    mostrarSugestoes();
}

// Busca no servidor, guarda no cache e redesenha
async function recarregar() {
    const crus = await buscarSugestoesBruto();
    cacheGravar("sugestoes", crus);
    mostrarBruto(crus);
}

// Se o login mudou, refaz a lista (o filtro é pelo usuárioAtual.id)
document.addEventListener("usuario-atualizado", mostrarSugestoes);

/* ================= JANELA DE EDIÇÃO ================= */

const janelaEditar = document.getElementById("janela-editar-sugestao");
const formEditar = document.getElementById("form-editar-sugestao");
let editandoId = null;

// Botões com data-fechar fecham a janela
formEditar.querySelectorAll("[data-fechar]").forEach((botao) =>
    botao.addEventListener("click", () => janelaEditar.close())
);

// Abre a janela preenchida com a sugestão clicada
function abrirEdicao(d) {
    editandoId = d.id;

    formEditar.elements.titulo.value = d.titulo || "";
    formEditar.elements.descricao.value = d.descricao || "";

    // A categoria foi salva com o rótulo bonito ("Jogabilidade"); o radio usa a chave
    const chaveCategoria = Object.keys(ROTULOS).find((k) => ROTULOS[k] === d.categoria) || "outros";
    formEditar.querySelector(`input[name="categoria"][value="${chaveCategoria}"]`).checked = true;

    // O ícone foi salvo pelo nome ("atck"...); o radio usa a posição (1..7)
    const posicaoIcone = ICONE_ORDEM.indexOf(d.icon ?? d.icone) + 1;
    formEditar.querySelector(`input[name="icone"][value="${posicaoIcone > 0 ? posicaoIcone : 1}"]`).checked = true;

    // Contadores de caracteres
    formEditar.querySelectorAll(".campo small").forEach((contador) => {
        const campo = contador.closest(".campo").querySelector("[maxlength]");
        if (campo) contador.textContent = campo.value.length + "/" + campo.maxLength;
    });

    janelaEditar.querySelector(".janela-corpo").scrollTop = 0;
    janelaEditar.showModal();
}

// Envia a edição para o servidor
formEditar.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const f = new FormData(formEditar);

    const dados = {
        titulo:    f.get("titulo").trim(),
        descricao: f.get("descricao").trim(),
        categoria: ROTULOS[f.get("categoria")] || "Outros",
        icon:      ICONE_ORDEM[Number(f.get("icone")) - 1] || "logo"
    };
    if (!dados.titulo || !dados.descricao) {
        alert("Preencha o título e a descrição.");
        return;
    }

    const botaoSalvar = formEditar.querySelector('button[type="submit"]');
    const pronto = botaoCarregando(botaoSalvar, "Salvando");
    try {
        await editarSugestao(editandoId, dados);
        await recarregar();
        janelaEditar.close();
        pronto();
    } catch (err) {
        alert(err.message);
        pronto();
    }
});

// Busca no servidor (ou mostra o cache na hora) e filtra as do usuário
carregarComCache("sugestoes", buscarSugestoesBruto, mostrarBruto, lista).catch(console.error);
