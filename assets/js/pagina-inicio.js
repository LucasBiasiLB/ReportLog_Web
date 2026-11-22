import { buscarUpdates, buscarSugestoes } from "./banco.js";

await sessaoPronta;   // garante que usuarioAtual já existe
document.querySelector(".saudacao span").textContent = usuarioAtual.nome;

// Botão "Criar update": só aparece para admin
const botaoCriarUpdate = document.getElementById("botao-criar-update");
if (usuarioAtual.admin) {
    botaoCriarUpdate.hidden = false;
    botaoCriarUpdate.addEventListener("click", abrirCriarUpdate);   // vem do janelas-update.js
}

// Formulário "Criar update" (por enquanto só a parte visual)
formularioUpdate.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const f = new FormData(formularioUpdate);
    const rascunho = evento.submitter && evento.submitter.value === "rascunho";

    if (!f.get("titulo").trim()) {
        alert("Coloque pelo menos o título.");
        return;
    }

    // Rascunho pode estar incompleto. Publicar precisa de tudo preenchido.
    if (!rascunho) {
        if (!f.get("descricao").trim()) return alert("Preencha a descrição curta.");

        // Uma novidade começada precisa de título e descrição (linha toda vazia é ignorada)
        const titulos = f.getAll("novidade-titulo");
        const descricoes = f.getAll("novidade-descricao");
        const incompleta = titulos.some((t, i) =>
            (t.trim() || descricoes[i].trim()) && (!t.trim() || !descricoes[i].trim())
        );
        if (incompleta) return alert("Toda novidade precisa de título e descrição (ou remova a que está incompleta).");
    }

    // TODO: salvar no banco (o updates.php ainda só aceita GET).
    // Os campos que o app salva: titulo, versao, data, descricao, imagem,
    // conteudo, status e as novidades (novidade-titulo, novidade-descricao, novidade-icone).
    console.log("Update (ainda não salvo):", { status: rascunho ? "rascunho" : "publicado", ...Object.fromEntries(f) });
    alert("Visual pronto! Falta ligar ao banco para salvar de verdade.");
    janelaCriarUpdate.close();
});

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