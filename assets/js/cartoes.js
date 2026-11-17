/* =====================================================================
Cards desta página:
    CartaoDestaque  → card grande do topo da tela inicial
    CartaoUpdate    → card de update com foto
    CartaoTexto     → card só de texto (Sugestões / Sobre nós)
    CartaoSugestao  → card de sugestão da comunidade
   ===================================================================== */


/* ---------- FERRAMENTAS PEQUENAS (usadas pelos cards) ---------- */

// Cria um elemento: el("div", "minha-classe", "texto")
function el(tag, classe, texto) {
    const e = document.createElement(tag);
    if (classe) e.className = classe;
    if (texto !== undefined) e.textContent = texto;
    return e;
}

// Cria um ícone SVG que usa o "sprite" (<symbol id="i-nome">) da página
function icone(nome) {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("class", "icone");
    const uso = document.createElementNS(ns, "use");
    uso.setAttribute("href", "#i-" + nome);
    svg.appendChild(uso);
    return svg;
}

// "2026-11-08" → "08/11/2026"
function formatarData(iso) {
    const [ano, mes, dia] = iso.split("-");
    return dia + "/" + mes + "/" + ano;
}


/* ---------- CARD DESTAQUE (grande, topo da tela inicial) ----------
   dados: { versao, titulo, descricao, data, imagem }                  */
function CartaoDestaque(dados) {
    const secao = el("section", "destaque");

    // Lado esquerdo: textos
    const texto = el("div", "destaque-texto");
    texto.append(
        el("span", "etiqueta", dados.versao),
        el("h2", "", dados.titulo),
        el("p", "destaque-descricao", dados.descricao)
    );
    const data = el("time", "destaque-data", formatarData(dados.data));
    data.dateTime = dados.data;
    const botao = el("a", "botao", "Ver detalhes ");
    botao.href = "#";
    botao.append(icone("seta"));
    texto.append(data, botao);
    secao.append(texto);

    // Lado direito: imagem (ou um bloco colorido se não tiver imagem)
    if (dados.imagem) {
        const img = el("img", "destaque-imagem");
        img.src = dados.imagem;
        img.alt = "";
        secao.append(img);
    } else {
        secao.append(el("div", "destaque-imagem destaque-sem-imagem"));
    }
    return secao;
}


/* ---------- CARD DE UPDATE (com foto) ----------
   dados: { versao, titulo, descricao, data, imagem }                  */
function CartaoUpdate(dados) {
    const cartao = el("article", "cartao");

    // Foto no topo, com o selo da versão por cima
    const foto = el("div", "cartao-foto");
    if (dados.imagem) {
        const img = el("img");
        img.src = dados.imagem;
        img.alt = "";
        foto.append(img);
    } else {
        foto.classList.add("cartao-foto-vazia");
    }
    foto.append(el("span", "selo", dados.versao));

    // Corpo: título, descrição e rodapé (data + seta)
    const corpo = el("div", "cartao-corpo");
    const base = el("div", "cartao-base");
    const seta = el("a", "seta-link");
    seta.href = "#";
    seta.setAttribute("aria-label", "Ver detalhes");
    seta.append(icone("seta"));
    base.append(el("span", "", formatarData(dados.data)), seta);
    corpo.append(el("h3", "", dados.titulo), el("p", "", dados.descricao), base);

    cartao.append(foto, corpo);
    return cartao;
}


/* ---------- CARD SÓ DE TEXTO (atalhos para outras páginas) ----------
   dados: { rotulo, titulo, texto, linkTexto, linkHref }               */
function CartaoTexto(dados) {
    const cartao = el("article", "cartao cartao-texto");
    const link = el("a", "link-pequeno", dados.linkTexto + " ");
    link.href = dados.linkHref;
    link.append(icone("seta"));
    cartao.append(
        el("p", "secao-rotulo", dados.rotulo),
        el("h3", "", dados.titulo),
        el("p", "", dados.texto),
        link
    );
    return cartao;
}


/* ---------- CARD DE SUGESTÃO ----------
   dados: { id, autor, uid, data, categoria, titulo, descricao,
            icone, curtidas, curtiuEu }
   acoes: { aoCurtir(id), aoExcluir(id) }  ← funções que a PÁGINA define.
   O card não mexe nos dados: só avisa a página que o botão foi clicado. */
function CartaoSugestao(dados, acoes) {
    const cartao = el("article", "sugestao");
    cartao.dataset.id = dados.id;

    // Topo: avatar + autor/data + categoria
    const topo = el("header", "sugestao-topo");
    const avatar = el("div", "avatar avatar-inicial", dados.autor.charAt(0).toUpperCase());
    const autor = el("div", "sugestao-autor");
    autor.append(el("strong", "", dados.autor), el("small", "", formatarData(dados.data)));
    topo.append(avatar, autor, el("span", "categoria-selo", dados.categoria));

    // Corpo: título + descrição + ícone escolhido
    const corpo = el("div", "sugestao-corpo");
    const texto = el("div", "sugestao-texto");
    texto.append(el("h3", "", dados.titulo), el("p", "", dados.descricao));
    const caixaIcone = el("div", "sugestao-icone");
    caixaIcone.append(icone(dados.icone));
    corpo.append(texto, caixaIcone);

    // Base: botão de curtir (+ excluir, só para o dono ou admin)
    const base = el("footer", "sugestao-base");
    const curtir = el("button", "curtir" + (dados.curtiuEu ? " curtido" : ""));
    curtir.type = "button";
    curtir.append(icone("coracao"), document.createTextNode(" " + dados.curtidas));
    curtir.addEventListener("click", () => acoes.aoCurtir(dados.id));
    base.append(curtir);

    const podeExcluir = usuarioAtual.admin || dados.uid === usuarioAtual.id;
    if (podeExcluir) {
        const excluir = el("button", "excluir");
        excluir.type = "button";
        excluir.setAttribute("aria-label", "Excluir sugestão");
        excluir.append(icone("lixo"));
        excluir.addEventListener("click", () => acoes.aoExcluir(dados.id));
        base.append(excluir);
    }

    cartao.append(topo, corpo, base);
    return cartao;
}
