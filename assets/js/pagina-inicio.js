import { buscarUpdatesBruto, normalizarUpdates, buscarSugestoesBruto, normalizarSugestoes, publicarUpdate } from "./banco.js";

await sessaoPronta;   // garante que usuarioAtual já existe
document.querySelector(".saudacao span").textContent = usuarioAtual.nome;

const botaoCriarUpdate = document.getElementById("botao-criar-update");
const secaoRascunhos = document.getElementById("secao-rascunhos");
const listaRascunhos = document.getElementById("lista-rascunhos");

// Rascunho aberto no formulário: o id (se veio da lista) e a imagem guardada
// (o <input type=file> não aceita valor, então a imagem viaja como dataURL)
let rascunhoAtual = null;
let imagemRascunho = null;

botaoCriarUpdate.addEventListener("click", () => {
    rascunhoAtual = null;
    imagemRascunho = null;
    abrirCriarUpdate();   // vem do janelas-update.js
});

// Nome na saudação, botão "Criar update" e seção de rascunhos (só para admin)
function aplicarUsuario() {
    document.querySelector(".saudacao span").textContent = usuarioAtual.nome;
    botaoCriarUpdate.hidden = !usuarioAtual.admin;
    renderRascunhos();
}

aplicarUsuario();
document.addEventListener("usuario-atualizado", aplicarUsuario);

/* ================= RASCUNHOS =================
   Ficam no localStorage DESTE navegador e DESTA conta de admin:
   chave "reportlog:v1:rascunhos-update:{idDoUsuario}". Não vão para o servidor. */

function chaveRascunhos() {
    return CACHE_PREFIXO + "rascunhos-update:" + usuarioAtual.id;
}

function lerRascunhos() {
    try {
        return JSON.parse(localStorage.getItem(chaveRascunhos())) || [];
    } catch {
        return [];
    }
}

function gravarRascunhos(lista) {
    try {
        localStorage.setItem(chaveRascunhos(), JSON.stringify(lista));
    } catch {
        alert("Não foi possível guardar o rascunho (armazenamento cheio ou bloqueado).");
    }
}

function arquivoParaDataURL(arquivo) {
    return new Promise((ok, erro) => {
        const leitor = new FileReader();
        leitor.onload = () => ok(leitor.result);
        leitor.onerror = erro;
        leitor.readAsDataURL(arquivo);
    });
}

function dataURLParaArquivo(dataUrl, nome) {
    return fetch(dataUrl)
        .then((r) => r.blob())
        .then((b) => new File([b], nome, { type: b.type }));
}

// Lê os campos do formulário e devolve o objeto do rascunho
async function coletarRascunho(f) {
    const imagem = f.get("imagem");
    const titulos = f.getAll("novidade-titulo[]");
    const descricoes = f.getAll("novidade-descricao[]");
    const icones = f.getAll("novidade-icone[]");

    const novidades = [];
    titulos.forEach((titulo, i) => {
        const t = titulo.trim();
        const d = (descricoes[i] || "").trim();
        if (t && d) novidades.push({ titulo: t, descricao: d, icone: icones[i] || "logo" });
    });

    return {
        titulo:    f.get("titulo").trim(),
        versao:    f.get("versao").trim(),
        data:      f.get("data") || "",
        descricao: f.get("descricao").trim(),
        conteudo:  f.get("conteudo").trim(),
        // arquivo novo escolhido → dataURL; senão mantém a imagem que já estava no rascunho
        imagem:    imagem instanceof File && imagem.size > 0
            ? await arquivoParaDataURL(imagem)
            : imagemRascunho,
        novidades,
        salvoEm: Date.now()
    };
}

async function salvarRascunho(f) {
    const dados = await coletarRascunho(f);
    const lista = lerRascunhos();
    const i = rascunhoAtual ? lista.findIndex((r) => r.id === rascunhoAtual) : -1;

    if (i >= 0) lista[i] = { ...lista[i], ...dados };        // atualiza o rascunho aberto
    else lista.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7), ...dados });

    gravarRascunhos(lista);
    rascunhoAtual = null;
    imagemRascunho = null;
    renderRascunhos();
}

function removerRascunho(id) {
    gravarRascunhos(lerRascunhos().filter((r) => r.id !== id));
    renderRascunhos();
}

// Um card por rascunho: título, versão/data e os botões Editar / Publicar / Excluir
function cartaoRascunho(d) {
    const cartao = el("article", "rascunho-card");

    const info = el("div", "rascunho-info");
    const meta = [
        d.versao ? "v" + d.versao : "sem versão",
        d.data ? formatarData(d.data) : "sem data",
        new Date(d.salvoEm).toLocaleDateString("sv-SE")
    ].join(" · ");
    info.append(
        el("strong", "", d.titulo || "(sem título)"),
        el("small", "", meta + " · " + (d.novidades?.length || 0) + " novidade(s)")
    );

    const acoes = el("div", "rascunho-acoes");

    const editar = el("button", "botao-contorno-pequeno", "Editar");
    editar.type = "button";
    editar.addEventListener("click", () => abrirRascunho(d));

    const publicar = el("button", "botao-contorno-pequeno", "Publicar");
    publicar.type = "button";
    publicar.addEventListener("click", () => publicarRascunho(d));

    const excluir = el("button", "botao-contorno-pequeno", "Excluir");
    excluir.type = "button";
    excluir.addEventListener("click", () => {
        if (confirm("Excluir este rascunho?")) removerRascunho(d.id);
    });

    acoes.append(editar, publicar, excluir);
    cartao.append(info, acoes);
    return cartao;
}

function renderRascunhos() {
    if (!usuarioAtual.admin) {
        secaoRascunhos.hidden = true;
        return;
    }
    const lista = lerRascunhos();
    listaRascunhos.replaceChildren(...lista.map(cartaoRascunho));
    secaoRascunhos.hidden = lista.length === 0;
}

// Abre a janela de criar update já preenchida com o rascunho
function abrirRascunho(d) {
    abrirCriarUpdate();                 // limpa o formulário e abre a janela
    rascunhoAtual = d.id;
    imagemRascunho = d.imagem || null;

    const e = formularioUpdate.elements;
    e.titulo.value    = d.titulo || "";
    e.versao.value    = d.versao || "";
    e.data.value      = d.data || "";
    e.descricao.value = d.descricao || "";
    e.conteudo.value  = d.conteudo || "";

    // A imagem não pode ir para o <input file>; mostra na prévia e guarda o dataURL
    const previa = document.getElementById("previa-imagem");
    if (imagemRascunho) {
        previa.src = imagemRascunho;
        previa.hidden = false;
    }

    // Uma linha de novidade para cada uma do rascunho (ou uma em branco)
    listaNovidadesForm.replaceChildren();
    const listaN = d.novidades?.length ? d.novidades : [null];
    listaN.forEach((n) => {
        adicionarNovidade();
        const linha = listaNovidadesForm.lastElementChild;
        if (n) {
            linha.querySelector('[name="novidade-titulo[]"]').value    = n.titulo;
            linha.querySelector('[name="novidade-descricao[]"]').value = n.descricao;
            linha.querySelector('[name="novidade-icone[]"]').value     = n.icone || "logo";
        }
    });

    // Atualiza os contadores de caracteres (o abrirCriarUpdate zerou tudo)
    formularioUpdate.querySelectorAll(".campo small").forEach((contador) => {
        const campo = contador.closest(".campo").querySelector("[maxlength]");
        if (campo) contador.textContent = campo.value.length + "/" + campo.maxLength;
    });
}

// Publica um rascunho direto da lista (sem abrir a janela)
async function publicarRascunho(d) {
    if (!confirm('Publicar "' + (d.titulo || "update sem título") + '"?')) return;

    const envio = new FormData();
    envio.append("status", "publicado");
    envio.append("titulo", d.titulo || "");
    envio.append("versao", d.versao || "");
    envio.append("data", d.data || "");
    envio.append("descricao", d.descricao || "");
    envio.append("conteudo", d.conteudo || "");
    if (d.imagem) envio.append("imagem", await dataURLParaArquivo(d.imagem, "update-destaque"));
    (d.novidades || []).forEach((n) => {
        envio.append("novidade-titulo[]", n.titulo);
        envio.append("novidade-descricao[]", n.descricao);
        envio.append("novidade-icone[]", n.icone || "logo");
    });

    try {
        await enviarUpdateServidor(envio);
        removerRascunho(d.id);
        alert("Update publicado!");
    } catch (err) {
        alert(err.message);
    }
}

// Manda o update para o servidor e atualiza o cache + a tela
async function enviarUpdateServidor(envio) {
    await publicarUpdate(envio);
    const novos = await buscarUpdatesBruto();
    cacheGravar("updates", novos);
    mostrarUpdates(novos);
}

/* ================= FORMULÁRIO ================= */

formularioUpdate.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const f = new FormData(formularioUpdate);
    const status = evento.submitter && evento.submitter.value === "rascunho" ? "rascunho" : "publicado";

    if (!f.get("titulo").trim()) {
        alert("Coloque pelo menos o título.");
        return;
    }

    // Rascunho pode estar incompleto. Publicar precisa de tudo preenchido.
    if (status === "publicado") {
        if (!f.get("descricao").trim()) return alert("Preencha a descrição curta.");
        if (!f.get("versao").trim()) return alert("Preencha a versão.");
        if (!f.get("data")) return alert("Escolha a data.");

        // Uma novidade começada precisa de título e descrição (linha toda vazia é ignorada)
        const titulos = f.getAll("novidade-titulo[]");
        const descricoes = f.getAll("novidade-descricao[]");
        const incompleta = titulos.some((t, i) =>
            (t.trim() || descricoes[i].trim()) && (!t.trim() || !descricoes[i].trim())
        );
        if (incompleta) return alert("Toda novidade precisa de título e descrição (ou remova a que está incompleta).");
    }

    // Rascunho fica só neste navegador; publicar vai para o servidor
    if (status === "rascunho") {
        await salvarRascunho(f);
        formularioUpdate.reset();
        janelaCriarUpdate.close();
        alert("Rascunho salvo neste navegador.");
        return;
    }

    // Monta o envio: campos de texto + imagem + novidades (um trio por linha)
    const envio = new FormData();
    envio.append("status", status);
    ["titulo", "versao", "data", "descricao", "conteudo"].forEach((campo) => {
        envio.append(campo, f.get(campo) ?? "");
    });

    const imagem = f.get("imagem");
    if (imagem instanceof File && imagem.size > 0) {
        envio.append("imagem", imagem);
    } else if (imagemRascunho) {
        // Editando um rascunho: a imagem veio do localStorage como dataURL
        envio.append("imagem", await dataURLParaArquivo(imagemRascunho, "update-destaque"));
    }

    const titulosN = f.getAll("novidade-titulo[]");
    const descricoesN = f.getAll("novidade-descricao[]");
    const iconesN = f.getAll("novidade-icone[]");
    titulosN.forEach((titulo, i) => {
        const descN = (descricoesN[i] || "").trim();
        if (!titulo.trim() && !descN) return;                    // linha vazia: fora
        if (!titulo.trim() || !descN) return;                    // incompleta: o servidor recusaria
        envio.append("novidade-titulo[]", titulo.trim());
        envio.append("novidade-descricao[]", descN);
        envio.append("novidade-icone[]", iconesN[i] || "logo");
    });

    const botoes = formularioUpdate.querySelectorAll("button[type=submit]");
    botoes.forEach((b) => (b.disabled = true));
    try {
        await enviarUpdateServidor(envio);
        if (rascunhoAtual) removerRascunho(rascunhoAtual);   // publicou o rascunho que estava aberto
        rascunhoAtual = null;
        imagemRascunho = null;
        formularioUpdate.reset();
        janelaCriarUpdate.close();
        alert("Update publicado!");
    } catch (err) {
        alert(err.message);
    } finally {
        botoes.forEach((b) => (b.disabled = false));
    }
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
