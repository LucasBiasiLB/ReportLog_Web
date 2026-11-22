import { buscarUpdatesBruto, normalizarUpdates, buscarSugestoesBruto, normalizarSugestoes } from "./banco.js";

await sessaoPronta;   // garante que usuarioAtual já existe
document.querySelector(".saudacao span").textContent = usuarioAtual.nome;

const botaoCriarUpdate = document.getElementById("botao-criar-update");
botaoCriarUpdate.addEventListener("click", abrirCriarUpdate);   // vem do janelas-update.js

// Nome na saudação e botão "Criar update" (só para admin)
function aplicarUsuario() {
    document.querySelector(".saudacao span").textContent = usuarioAtual.nome;
    botaoCriarUpdate.hidden = !usuarioAtual.admin;
}

aplicarUsuario();
document.addEventListener("usuario-atualizado", aplicarUsuario);

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

let destaqueAtual = document.getElementById("destaque");   // o card grande troca este elemento
const faixa = document.getElementById("carrossel");
const secaoCarrossel = document.getElementById("secao-carrossel");

// Desenha updates a partir dos dados crus (do cache ou do servidor)
function mostrarUpdates(crus) {
    const [maisNovo, ...outros] = normalizarUpdates(crus);

    // 1) O mais recente vira o card grande
    const novo = maisNovo
        ? CartaoDestaque(maisNovo)
        : el("p", "vazio", "Ainda não há updates publicados.");
    destaqueAtual.replaceWith(novo);
    destaqueAtual = novo;

    // 2) Todos os outros vão para o carrossel
    faixa.replaceChildren();
    outros.forEach((u) => faixa.append(CartaoUpdate(u)));
    secaoCarrossel.hidden = outros.length === 0;
}

// Sugestão mais curtida
const areaSugestao = document.getElementById("sugestao-top");
const secaoSugestao = document.getElementById("secao-sugestao-top");

function mostrarSugestaoTop(crus) {
    const todas = normalizarSugestoes(crus);   // já vem da mais nova para a mais antiga
    areaSugestao.replaceChildren();
    secaoSugestao.hidden = todas.length === 0;
    if (todas.length === 0) return;

    // Maior número de curtidas; em caso de empate, fica a mais nova
    const top = todas.reduce((melhor, s) => (s.curtidas > melhor.curtidas ? s : melhor));
    areaSugestao.append(CartaoSugestaoTop(top));
}

// Cada bloco mostra o que está salvo na hora; a rodinha só aparece se não houver nada
Promise.allSettled([
    carregarComCache("updates", buscarUpdatesBruto, mostrarUpdates, destaqueAtual),
    carregarComCache("sugestoes", buscarSugestoesBruto, mostrarSugestaoTop, areaSugestao)
]).then((resultados) =>
    resultados.forEach((r) => r.status === "rejected" && console.error(r.reason))
);