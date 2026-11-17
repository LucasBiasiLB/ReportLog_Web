function montarInicio() {
    const areaDestaque = document.getElementById("destaque");
    const areaCartoes = document.getElementById("cartoes");

    const lista = buscarUpdates();          // do mais novo para o mais antigo
    const [maisNovo, ...outros] = lista;    // o 1º vira destaque, o resto vira card

    // 1) Card grande
    if (maisNovo) areaDestaque.replaceWith(CartaoDestaque(maisNovo));

    // 2) O update mais recente depois do destaque (card com foto)
    if (outros[0]) areaCartoes.append(CartaoUpdate(outros[0]));

    // 3) Dois cards só de texto (atalhos)
    areaCartoes.append(
        CartaoTexto({
            rotulo: "COMUNIDADE",
            titulo: "Sugestões",
            texto: "Compartilhe ideias para melhorar o ReportLog.",
            linkTexto: "Ver sugestões",
            linkHref: "sugestoes.html"
        }),
        CartaoTexto({
            rotulo: "CONHEÇA",
            titulo: "Sobre nós",
            texto: "Saiba quem faz o ReportLog e como o jogo nasceu.",
            linkTexto: "Saiba mais",
            linkHref: "sobre-nos.html"
        })
    );
}

montarInicio();
