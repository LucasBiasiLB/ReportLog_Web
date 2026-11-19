/* ---------- DADOS DE EXEMPLO ---------- */
const NOTIFICACOES_EXEMPLO = [
    {
        id: "n1",
        titulo: "Update v0.0.3 disponível",
        texto: "Novo saque viagem e ajustes na física da bola.",
        tempo: "há 2 horas",
        lida: false
    }
];

// Tamanhos da janela (em pixels)
const NOTIF_LARGURA_INICIAL = 340;
const NOTIF_ALTURA_INICIAL = 400;
const NOTIF_LARGURA_MINIMA = 280;
const NOTIF_ALTURA_MINIMA = 220;


/* ---------- CARD DE NOTIFICAÇÃO ----------
   dados: { id, titulo, texto, tempo, lida }                           */
function CartaoNotificacao(dados) {
    const cartao = el("article", "notif" + (dados.lida ? "" : " notif-nova"));

    const caixaIcone = el("div", "notif-icone");
    caixaIcone.append(icone("sino"));

    const corpo = el("div", "notif-corpo");
    corpo.append(
        el("h3", "", dados.titulo),
        el("p", "", dados.texto),
        el("small", "", dados.tempo)
    );

    cartao.append(caixaIcone, corpo);
    if (!dados.lida) cartao.append(el("span", "notif-ponto"));   // bolinha azul = não lida
    return cartao;
}


/* ---------- MONTA A JANELA (e coloca no <body>) ---------- */
function criarJanelaNotificacoes() {
    const janela = el("section", "janela-notif");
    janela.hidden = true;                                  // começa fechada
    janela.setAttribute("role", "dialog");
    janela.setAttribute("aria-label", "Notificações");

    // Cabeçalho (é por aqui que se arrasta a janela)
    const topo = el("header", "janela-notif-topo");
    const novas = NOTIFICACOES_EXEMPLO.filter((n) => !n.lida).length;
    const fechar = el("button", "janela-notif-fechar", "×");
    fechar.type = "button";
    fechar.setAttribute("aria-label", "Fechar notificações");
    topo.append(
        el("h2", "", "Notificações"),
        el("span", "janela-notif-contagem", novas + (novas === 1 ? " nova" : " novas")),
        fechar
    );

    // Lista de cards (rola se passar da altura)
    const lista = el("div", "janela-notif-lista");
    NOTIFICACOES_EXEMPLO.forEach((n) => lista.append(CartaoNotificacao(n)));

    // Cantinho para redimensionar
    const alca = el("div", "janela-notif-alca");
    alca.title = "Arraste para mudar o tamanho";

    janela.append(topo, lista, alca);
    document.body.append(janela);

    fechar.addEventListener("click", () => (janela.hidden = true));
    tornarArrastavel(janela, topo);
    tornarRedimensionavel(janela, alca);
    return janela;
}


/* ---------- ARRASTAR ----------
   Segurando no cabeçalho, a janela acompanha o mouse/dedo, sem sair da tela. */
function tornarArrastavel(janela, alcaTopo) {
    alcaTopo.addEventListener("pointerdown", (e) => {
        if (e.target.closest("button")) return;            // clique no × não arrasta

        const caixa = janela.getBoundingClientRect();
        const sobraX = e.clientX - caixa.left;             // onde o mouse pegou na janela
        const sobraY = e.clientY - caixa.top;
        alcaTopo.setPointerCapture(e.pointerId);           // continua recebendo o movimento
        janela.classList.add("arrastando");

        function mover(ev) {
            const esq = ev.clientX - sobraX;
            const cima = ev.clientY - sobraY;
            janela.style.left = limitar(esq, 0, window.innerWidth - janela.offsetWidth) + "px";
            janela.style.top = limitar(cima, 0, window.innerHeight - janela.offsetHeight) + "px";
        }

        function soltar() {
            janela.classList.remove("arrastando");
            alcaTopo.removeEventListener("pointermove", mover);
            alcaTopo.removeEventListener("pointerup", soltar);
            alcaTopo.removeEventListener("pointercancel", soltar);
        }

        alcaTopo.addEventListener("pointermove", mover);
        alcaTopo.addEventListener("pointerup", soltar);
        alcaTopo.addEventListener("pointercancel", soltar);
    });
}


/* ---------- REDIMENSIONAR ----------
   Puxando o cantinho, muda largura e altura (com mínimo e máximo). */
function tornarRedimensionavel(janela, alca) {
    alca.addEventListener("pointerdown", (e) => {
        const caixa = janela.getBoundingClientRect();
        const larguraInicial = caixa.width;
        const alturaInicial = caixa.height;
        const xInicial = e.clientX;
        const yInicial = e.clientY;
        alca.setPointerCapture(e.pointerId);
        janela.classList.add("arrastando");

        function mudar(ev) {
            const maxLargura = window.innerWidth - caixa.left;    // não passa da borda da tela
            const maxAltura = window.innerHeight - caixa.top;
            janela.style.width = limitar(larguraInicial + ev.clientX - xInicial, NOTIF_LARGURA_MINIMA, maxLargura) + "px";
            janela.style.height = limitar(alturaInicial + ev.clientY - yInicial, NOTIF_ALTURA_MINIMA, maxAltura) + "px";
        }

        function soltar() {
            janela.classList.remove("arrastando");
            alca.removeEventListener("pointermove", mudar);
            alca.removeEventListener("pointerup", soltar);
            alca.removeEventListener("pointercancel", soltar);
        }

        alca.addEventListener("pointermove", mudar);
        alca.addEventListener("pointerup", soltar);
        alca.addEventListener("pointercancel", soltar);
    });
}


/* Mantém um número entre um mínimo e um máximo */
function limitar(valor, minimo, maximo) {
    return Math.max(minimo, Math.min(valor, maximo));
}


/* ---------- ABRIR / FECHAR PELO SINO ---------- */
function iniciarNotificacoes() {
    let janela = null;                                     // só é criada no 1º clique

    function alternar() {
        if (!janela) {
            janela = criarJanelaNotificacoes();
            // posição inicial: canto superior direito, logo abaixo do topo
            const largura = Math.min(NOTIF_LARGURA_INICIAL, window.innerWidth - 24);
            janela.style.width = largura + "px";
            janela.style.height = Math.min(NOTIF_ALTURA_INICIAL, window.innerHeight - 90) + "px";
            janela.style.left = Math.max(12, window.innerWidth - largura - 24) + "px";
            janela.style.top = "70px";
        }
        janela.hidden = !janela.hidden;
    }

    document.querySelectorAll(".botao-sino").forEach((b) => b.addEventListener("click", alternar));

    // Tecla Esc fecha a janela
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && janela) janela.hidden = true;
    });

    // Se a tela diminuir, a janela não fica "perdida" fora dela
    window.addEventListener("resize", () => {
        if (!janela) return;
        janela.style.left = limitar(janela.offsetLeft, 0, Math.max(0, window.innerWidth - janela.offsetWidth)) + "px";
        janela.style.top = limitar(janela.offsetTop, 0, Math.max(0, window.innerHeight - janela.offsetHeight)) + "px";
    });
}

iniciarNotificacoes();
