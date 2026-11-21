import { buscarUpdates, buscarSugestoes } from "./banco.js";

await sessaoPronta;   // garante que usuarioAtual já existe
document.querySelector(".saudacao span").textContent = usuarioAtual.nome;

async function montarUpdates() {
    const areaDestaque = document.getElementById("destaque");
    const faixa = document.getElementById("carrossel");
    const secaoCarrossel = document.getElementById("secao-carrossel");

    const [maisNovo, ...outros] = await buscarUpdates();

    // 1) O mais recente vira o card grande
    if (maisNovo) {
        areaDestaque.replaceWith(CartaoDestaque(maisNovo));
    } else {
        areaDestaque.replaceWith(el("p", "vazio", "Ainda não há updates publicados."));
    }

    // 2) Todos os outros vão para o carrossel
    if (outros.length === 0) {
        secaoCarrossel.hidden = true;
        return;
    }
    outros.forEach((u) => faixa.append(CartaoUpdate(u)));

    const rolar = (direcao) =>
        faixa.scrollBy({ left: direcao * faixa.clientWidth * 0.8, behavior: "smooth" });
    document.getElementById("carrossel-anterior").addEventListener("click", () => rolar(-1));
    document.getElementById("carrossel-proximo").addEventListener("click", () => rolar(1));
}

async function montarSugestaoTop() {
    const area = document.getElementById("sugestao-top");
    const secao = document.getElementById("secao-sugestao-top");

    const todas = await buscarSugestoes();   // já vem da mais nova para a mais antiga
    if (todas.length === 0) {
        secao.hidden = true;
        return;
    }
    // Maior número de curtidas; em caso de empate, fica a mais nova
    const top = todas.reduce((melhor, s) => (s.curtidas > melhor.curtidas ? s : melhor));
    area.append(CartaoSugestaoTop(top));
}

Promise.allSettled([montarUpdates(), montarSugestaoTop()]).then((resultados) =>
    resultados.forEach((r) => r.status === "rejected" && console.error(r.reason))
);