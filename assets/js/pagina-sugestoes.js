const lista = document.getElementById("lista-sugestoes");
const contador = document.getElementById("contador-sugestoes");
const formulario = document.getElementById("form-sugestao");

// Ações que os cards chamam quando o usuário clica nos botões
const acoes = {
    aoCurtir(id) {
        alternarCurtida(id);
        desenharLista();
    },
    aoExcluir(id) {
        if (confirm("Excluir esta sugestão?")) {
            excluirSugestao(id);
            desenharLista();
        }
    }
};

// Limpa a lista e desenha um card para cada sugestão
function desenharLista() {
    const todas = buscarSugestoes();
    lista.replaceChildren();                       // apaga o que tinha
    todas.forEach((s) => lista.append(CartaoSugestao(s, acoes)));

    // Mensagem quando não há nenhuma
    if (todas.length === 0) {
        lista.append(el("p", "vazio", "Ainda não há sugestões. Seja o primeiro!"));
    }
    contador.textContent = todas.length + (todas.length === 1 ? " publicação" : " publicações");
}

// Formulário "Nova sugestão"
formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();                       // não recarrega a página
    const f = new FormData(formulario);
    const titulo = f.get("titulo").trim();
    const descricao = f.get("descricao").trim();
    if (!titulo || !descricao) return;             // campos vazios: ignora

    const rotulos = { jogabilidade: "Jogabilidade", personagens: "Personagens",
                    interface: "Interface", graficos: "Gráficos", outros: "Outros" };

    publicarSugestao({
        titulo,
        descricao,
        categoria: rotulos[f.get("categoria")],
        icone: ICONES_SUGESTAO[Number(f.get("icone")) - 1]
    });

    formulario.reset();
    formulario.querySelectorAll(".campo small").forEach((s) => {
        s.textContent = "0/" + s.textContent.split("/")[1];   // zera os contadores
    });
    desenharLista();
});

desenharLista();
