/* =====================================================================
Janelas de update (só a parte visual: abrir, fechar, preencher).
Quem salva no banco é a página que usa (pagina-inicio.js).

    abrirVerUpdate(dados)  → abre "Visualizar Update" já preenchida
    abrirCriarUpdate()     → abre "Criar Update" limpa
                             (a janela de criar só existe na tela inicial)
   ===================================================================== */

const janelaVerUpdate = document.getElementById("janela-ver-update");
const janelaCriarUpdate = document.getElementById("janela-criar-update");   // null fora da tela inicial
const formularioUpdate = document.getElementById("form-update");
const listaNovidadesForm = document.getElementById("lista-novidades");


/* ---------- VER UPDATE ----------
   dados: { versao, titulo, descricao, data, imagem, novidades, conteudo } */
function abrirVerUpdate(dados) {
    const numeroVersao = dados.versao.replace(/^v/i, "");      // "v1.2.3" → "1.2.3"

    // Parte de cima
    document.getElementById("ver-versao").textContent = "v" + numeroVersao;
    document.getElementById("ver-titulo").textContent = dados.titulo;
    document.getElementById("ver-descricao").textContent = dados.descricao;
    document.getElementById("ver-data").textContent = dados.data ? formatarData(dados.data) : "";
    document.getElementById("ver-versao-texto").textContent = numeroVersao;

    // Imagem (sem imagem, usa o banner padrão, igual ao app)
    document.getElementById("ver-imagem").src = dados.imagem || "../../assets/image/banner.png";

    // Novidades (um card para cada)
    const novidades = dados.novidades || [];
    const listaNovidades = document.getElementById("ver-novidades");
    listaNovidades.replaceChildren();
    novidades.forEach((n) => listaNovidades.append(CartaoNovidade(n)));
    document.getElementById("ver-bloco-novidades").hidden = novidades.length === 0;

    // Detalhes (texto com Markdown simples)
    const areaDetalhes = document.getElementById("ver-detalhes");
    areaDetalhes.replaceChildren();
    if (dados.conteudo) areaDetalhes.append(MarkdownSimples(dados.conteudo));
    document.getElementById("ver-bloco-detalhes").hidden = !dados.conteudo;

    // Começa sempre do topo
    janelaVerUpdate.querySelector(".janela-corpo").scrollTop = 0;
    janelaVerUpdate.showModal();
}


/* ---------- CRIAR UPDATE ---------- */
function abrirCriarUpdate() {
    formularioUpdate.reset();
    formularioUpdate.elements.data.value = new Date().toLocaleDateString("sv-SE");   // hoje (AAAA-MM-DD)

    // zera a pré-visualização e os contadores de texto
    document.getElementById("previa-imagem").hidden = true;
    formularioUpdate.querySelectorAll(".campo small").forEach((contador) => {
        const campo = contador.closest(".campo").querySelector("[maxlength]");
        contador.textContent = "0/" + campo.maxLength;
    });

    // começa com uma novidade em branco
    listaNovidadesForm.replaceChildren();
    adicionarNovidade();

    janelaCriarUpdate.querySelector(".janela-corpo").scrollTop = 0;
    janelaCriarUpdate.showModal();
}

// Copia o <template id="modelo-novidade"> para a lista
function adicionarNovidade() {
    const modelo = document.getElementById("modelo-novidade");
    const linha = modelo.content.firstElementChild.cloneNode(true);
    linha.querySelector(".novidade-remover").addEventListener("click", () => linha.remove());

    // o contador de caracteres também funciona nas linhas novas
    linha.querySelectorAll("input[maxlength]").forEach((campo) => {
        const contador = campo.closest(".campo").querySelector("small");
        campo.addEventListener("input", () => {
            contador.textContent = campo.value.length + "/" + campo.maxLength;
        });
    });

    listaNovidadesForm.append(linha);
}

if (janelaCriarUpdate) {
    document.getElementById("botao-add-novidade").addEventListener("click", adicionarNovidade);

    // A tecla Esc fecha a janela sozinha: se já tem título digitado, pergunta antes
    janelaCriarUpdate.addEventListener("cancel", (evento) => {
        if (formularioUpdate.elements.titulo.value.trim() && !confirm("Fechar e perder o que você digitou?")) {
            evento.preventDefault();
        }
    });

    // Mostra a imagem escolhida na pré-visualização
    formularioUpdate.elements.imagem.addEventListener("change", () => {
        const arquivo = formularioUpdate.elements.imagem.files[0];
        const previa = document.getElementById("previa-imagem");
        if (!arquivo) {
            previa.hidden = true;
            return;
        }
        previa.src = URL.createObjectURL(arquivo);
        previa.hidden = false;
    });
}


/* ---------- FECHAR ---------- */
// Qualquer botão com data-fechar fecha a janela em que ele está
document.querySelectorAll("[data-fechar]").forEach((botao) => {
    botao.addEventListener("click", () => botao.closest("dialog").close());
});

// Clicar no fundo escuro também fecha a janela de ver (na de criar não,
// para ninguém perder o que digitou sem querer)
janelaVerUpdate.addEventListener("click", (evento) => {
    if (evento.target === janelaVerUpdate) janelaVerUpdate.close();
});
