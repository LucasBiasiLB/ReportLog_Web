/* =====================================================================
Cards desta página:
    CartaoDestaque  → card grande do topo da tela inicial
    CartaoUpdate    → card de update com foto
    CartaoUpdateLinha → update em linha (tela "Todas as atualizações")
    CartaoNovidade  → uma novidade dentro da janela "Ver update"
    MarkdownSimples → texto detalhado do update (títulos, listas e parágrafos)
    CartaoTexto     → card só de texto (Sugestões / Sobre nós)
    CartaoSugestao  → card de sugestão da comunidade
    CartaoSugestaoLinha → sugestão em linha (tela "Minhas sugestões")
   ===================================================================== */


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
    botao.addEventListener("click", (evento) => {
        evento.preventDefault();
        abrirVerUpdate(dados);          // vem do janelas-update.js
    });
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
    seta.addEventListener("click", (evento) => {
        evento.preventDefault();
        abrirVerUpdate(dados);
    });
    seta.append(icone("seta"));
    base.append(el("span", "", formatarData(dados.data)), seta);
    corpo.append(el("h3", "", dados.titulo), el("p", "", dados.descricao), base);

    cartao.append(foto, corpo);
    return cartao;
}



/* ---------- CARD DE SUGESTÃO ----------
    dados: { id, autor, uid, data, categoria, titulo, descricao,
            icone, curtidas, curtiuEu, fotoPerfil }
    acoes: { aoCurtir(id), aoExcluir(id) }  ← funções que a PÁGINA define.
    O card não mexe nos dados: só avisa a página que o botão foi clicado. */

function CartaoSugestao(dados, acoes) {
    const cartao = el("article", "sugestao");
    cartao.dataset.id = dados.id;

    // Topo: avatar + autor/data + categoria
    const topo = el("header", "sugestao-topo");
    // Se o usuário tem fotoPerfil (URL vinda do join com 'usuarios'), mostra a imagem;
    // senão, mostra a inicial do nome como antes.
    let avatar;
    if (dados.fotoPerfil) {
        avatar = el("img", "avatar");
        avatar.src = dados.fotoPerfil;
        avatar.alt = dados.autor || "";
    } else {
        avatar = el("div", "avatar avatar-inicial", (dados.autor || "?").charAt(0).toUpperCase());
    }
    const autor = el("div", "sugestao-autor");
    autor.append(el("strong", "", dados.autor), el("small", "", formatarData(dados.data)));
    topo.append(avatar, autor, el("span", "categoria-selo", dados.categoria));

    // Corpo: título + descrição + ícone escolhido
    const corpo = el("div", "sugestao-corpo");
    const texto = el("div", "sugestao-texto");
    texto.append(el("h3", "", dados.titulo), el("p", "", dados.descricao));
    const caixaIcone = el("div", "sugestao-icone");
    // dados.icon guarda o NOME ("atck", "def"...); ICONS traduz para o caminho da imagem
    const imgIcone = el("img", "icone-item");
    const chaveIcone = (dados.icon || "").replace("#", "");
    imgIcone.src = ICONS[chaveIcone] || "/ReportLog_Web/assets/icons/logo.png";
    imgIcone.alt = chaveIcone;
    caixaIcone.append(imgIcone);
    corpo.append(texto, caixaIcone);

    // Base: botão de curtir (+ excluir, só para o dono ou admin)
    const base = el("footer", "sugestao-base");
    const curtir = el("button", "curtir" + (dados.curtiuEu ? " curtido" : ""));
    curtir.type = "button";
    curtir.append(icone("coracao"), document.createTextNode(" " + dados.curtidas));
    curtir.addEventListener("click", () => acoes.aoCurtir(dados.id));
    base.append(curtir);

    const podeExcluir = usuarioAtual.admin || dados.uid === usuarioAtual.id;
    if (podeExcluir && acoes.aoExcluir) {   // só mostra se a página passou aoExcluir
        const excluir = el("button", "sugestao-linha-excluir");
        excluir.type = "button";
        excluir.setAttribute("aria-label", "Excluir sugestão");
        excluir.append(icone("lixo"));
        excluir.addEventListener("click", () => acoes.aoExcluir(dados.id));
        base.append(excluir);
    }

    cartao.append(topo, corpo, base);
    return cartao;
}

/* ---------- CARD DA SUGESTÃO MAIS CURTIDA (tela inicial) ----------
   dados: uma sugestão já normalizada (vinda do banco.js)              */
function CartaoSugestaoTop(dados) {
    const cartao = el("article", "sugestao sugestao-top");

    const topo = el("header", "sugestao-topo");
    let avatar;
    if (dados.fotoPerfil) {
        avatar = el("img", "avatar");
        avatar.src = dados.fotoPerfil;
        avatar.alt = dados.autor || "";
    } else {
        avatar = el("div", "avatar avatar-inicial", (dados.autor || "?").charAt(0).toUpperCase());
    }
    const autor = el("div", "sugestao-autor");
    autor.append(el("strong", "", dados.autor), el("small", "", formatarData(dados.data)));
    topo.append(avatar, autor, el("span", "categoria-selo", dados.categoria));

    const corpo = el("div", "sugestao-texto");
    corpo.append(el("h3", "", dados.titulo), el("p", "", dados.descricao));

    const base = el("footer", "sugestao-base");
    const curtidas = el("span", "sugestao-curtidas");
    curtidas.append(icone("coracao"), document.createTextNode(" " + dados.curtidas));

    const botao = el("a", "botao", "Ver sugestões ");
    botao.href = "sugestoes.html#" + dados.id;      // o #id é usado no passo 7
    botao.append(icone("seta"));

    base.append(curtidas, botao);
    cartao.append(topo, corpo, base);
    return cartao;
}



/* ---------- UPDATE EM LINHA (tela "Todas as atualizações") ----------
    dados: { id, versao, titulo, descricao, data, imagem }
    acoes: { aoAbrir(dados), aoExcluir(id) }  ← a página define.
           O botão de excluir só aparece para admin.                    */
function CartaoUpdateLinha(dados, acoes) {
    const linha = el("article", "update-linha");
    linha.tabIndex = 0;
    linha.setAttribute("role", "button");
    linha.setAttribute("aria-label", "Ver detalhes: " + dados.titulo);

    // Foto (se não tiver, usa o banner padrão, igual ao app)
    const foto = el("div", "update-linha-imagem");
    const img = el("img");
    img.src = dados.imagem || "../../assets/image/banner.png";
    img.alt = "";
    foto.append(img);

    // Textos
    const texto = el("div", "update-linha-texto");
    texto.append(
        el("span", "etiqueta", "UPDATE " + dados.versao),
        el("h3", "", dados.titulo),
        el("p", "", dados.descricao),
        el("time", "update-linha-data", dados.data ? formatarData(dados.data) : "")
    );

    // Lado direito: lixeira (só admin) e a setinha
    const lado = el("div", "update-linha-acoes");
    if (usuarioAtual.admin && acoes.aoExcluir) {
        const excluir = el("button", "update-linha-excluir");
        excluir.type = "button";
        excluir.setAttribute("aria-label", "Excluir update");
        excluir.append(icone("lixo"));
        excluir.addEventListener("click", (evento) => {
            evento.stopPropagation();           // não abre a janela junto
            acoes.aoExcluir(dados.id);
        });
        lado.append(excluir);
    }
    lado.append(icone("direita"));

    linha.append(foto, texto, lado);
    linha.addEventListener("click", () => acoes.aoAbrir(dados));
    linha.addEventListener("keydown", (evento) => {
        if (evento.key === "Enter") acoes.aoAbrir(dados);
    });
    return linha;
}


/* ---------- SUGESTÃO EM LINHA (tela "Minhas sugestões") ----------
    dados: { id, data, categoria, titulo, descricao, icon, curtidas }
    acoes: { aoAbrir(dados), aoExcluir(id) }  ← a página define.
    Mesmo formato da linha de update, mas com o ícone da sugestão no lugar da foto. */
function CartaoSugestaoLinha(dados, acoes) {
    const linha = el("article", "sugestao-linha");
    linha.tabIndex = 0;
    linha.setAttribute("role", "button");
    linha.setAttribute("aria-label", "Ver sugestão: " + dados.titulo);

    // Ícone que o usuário escolheu (dados.icon guarda o NOME; ICONS traduz para o caminho)
    const imgIcone = el("img", "icone-item");
    const chaveIcone = (dados.icon || "").replace("#", "");
    imgIcone.src = ICONS[chaveIcone] || ICONS.logo;
    imgIcone.alt = "";

    // Textos: categoria, título, descrição e (data + curtidas)
    const texto = el("div", "sugestao-linha-texto");
    const meta = el("div", "sugestao-linha-meta");
    const curtidas = el("span", "sugestao-linha-curtidas");
    curtidas.append(icone("coracao"), document.createTextNode(" " + dados.curtidas));
    meta.append(el("time", "", dados.data ? formatarData(dados.data) : ""), curtidas);
    texto.append(
        el("span", "categoria-selo", dados.categoria),
        el("h3", "", dados.titulo),
        el("p", "", dados.descricao),
        meta
    );

    // Lado direito: editar, lixeira (a sugestão é do próprio usuário) e a setinha
    const lado = el("div", "sugestao-linha-acoes");
    if (acoes.aoEditar) {
        const editar = el("button", "sugestao-linha-editar");
        editar.type = "button";
        editar.setAttribute("aria-label", "Editar sugestão");
        editar.append(icone("editar"));
        editar.addEventListener("click", (evento) => {
            evento.stopPropagation();           // não abre a sugestão junto
            acoes.aoEditar(dados);
        });
        lado.append(editar);
    }
    if (acoes.aoExcluir) {
        const excluir = el("button", "sugestao-linha-excluir");
        excluir.type = "button";
        excluir.setAttribute("aria-label", "Excluir sugestão");
        excluir.append(icone("lixo"));
        excluir.addEventListener("click", (evento) => {
            evento.stopPropagation();           // não abre a sugestão junto
            acoes.aoExcluir(dados.id);
        });
        lado.append(excluir);
    }
    lado.append(icone("direita"));

    linha.append(imgIcone, texto, lado);
    linha.addEventListener("click", () => acoes.aoAbrir(dados));
    linha.addEventListener("keydown", (evento) => {
        if (evento.key === "Enter") acoes.aoAbrir(dados);
    });
    return linha;
}


/* ---------- NOVIDADE (dentro da janela "Ver update") ----------
    dados: { titulo, descricao, imagem }
    "imagem" pode ser o nome de um ícone pronto ("atck", "def"...) ou uma URL. */
function CartaoNovidade(dados) {
    const cartao = el("article", "novidade");

    const caixa = el("div", "novidade-icone");
    const origem = dados.imagem ? (ICONS[dados.imagem] || dados.imagem) : "";
    if (origem) {
        const img = el("img");
        img.src = origem;
        img.alt = "";
        caixa.append(img);
    } else {
        caixa.append(icone("estrela"));     // sem imagem: uma estrela só
    }

    const texto = el("div", "novidade-texto");
    texto.append(el("strong", "", dados.titulo), el("p", "", dados.descricao));

    cartao.append(caixa, texto);
    return cartao;
}


/* ---------- MARKDOWN SIMPLES ----------
    Entende só: títulos (#, ##, ###), listas (- ou *) e parágrafos.
    Não entende negrito, links nem imagens (igual ao app). */
function MarkdownSimples(texto) {
    const area = el("div", "markdown");

    texto.split("\n").forEach((linha) => {
        const l = linha.trimEnd();
        if (l.trim() === "") return;                         // linha vazia: o espaço vem do CSS

        const titulo = l.match(/^(#{1,3})\s+(.*)$/);         // "## Novidades"
        if (titulo) {
            area.append(el("p", "md-titulo md-titulo-" + titulo[1].length, titulo[2]));
            return;
        }

        const item = l.match(/^\s*[-*]\s+(.*)$/);            // "- texto"
        if (item) {
            area.append(el("p", "md-item", item[1]));
            return;
        }

        area.append(el("p", "", l));                         // parágrafo normal
    });

    return area;
}
