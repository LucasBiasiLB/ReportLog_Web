const API_PERFIL   = "/ReportLog_Web/src/api/perfil.php";
const PADRAO_FOTO  = "/ReportLog_Web/assets/image/avatar.png";
const PADRAO_CAPA  = "/ReportLog_Web/assets/image/banner.png";

await sessaoPronta;

const form        = document.getElementById("form-editar-perfil");
const campoNome   = document.getElementById("campo-nome");
const campoBio    = document.getElementById("campo-bio");
const avatar      = document.querySelector(".editar-avatar");
const banner      = document.querySelector(".editar-banner");      // agora é uma <img>
const botaoSalvar = form.querySelector(".editar-salvar");

// Mudanças que só valem depois do "Salvar alterações"
let novaFoto = null;              // arquivos escolhidos (ainda não enviados)
let novaCapa = null;
let voltarFotoPadrao = false;
let voltarCapaPadrao = false;

// Preenche o formulário com os dados atuais
campoNome.value = usuarioAtual.nome;
campoBio.value  = usuarioAtual.descricao || "";
[campoNome, campoBio].forEach((c) => c.dispatchEvent(new Event("input")));   // atualiza os contadores
avatar.src = usuarioAtual.fotoPerfil || PADRAO_FOTO;
banner.src = usuarioAtual.fotoCapa   || PADRAO_CAPA;

// Abre o seletor de arquivo; ao escolher, devolve o arquivo e uma prévia local
function escolherImagem(aoEscolher) {
    const entrada = el("input");
    entrada.type = "file";
    entrada.accept = "image/jpeg,image/png,image/webp";
    entrada.addEventListener("change", () => {
        const arquivo = entrada.files[0];
        if (!arquivo) return;
        if (!arquivo.type.startsWith("image/")) return alert("Escolha uma imagem");
        if (arquivo.size > 5 * 1024 * 1024) return alert("A imagem é grande demais (máximo 5 MB)");
        aoEscolher(arquivo, URL.createObjectURL(arquivo));
    });
    entrada.click();
}

// Câmera → foto de perfil (só prévia; vale ao salvar)
document.querySelector(".editar-camera").addEventListener("click", () =>
    escolherImagem((arquivo, previa) => {
        novaFoto = arquivo;
        voltarFotoPadrao = false;
        avatar.src = previa;
    })
);

// Clique no banner → capa (só prévia; vale ao salvar)
document.querySelector(".editar-banner-btn").addEventListener("click", () =>
    escolherImagem((arquivo, previa) => {
        novaCapa = arquivo;
        voltarCapaPadrao = false;
        banner.src = previa;
    })
);

// "Foto do perfil padrão"
document.getElementById("btn-foto-padrao").addEventListener("click", () => {
    novaFoto = null;
    voltarFotoPadrao = true;
    avatar.src = PADRAO_FOTO;
});

// "Plano de fundo padrão"
document.getElementById("btn-capa-padrao").addEventListener("click", () => {
    novaCapa = null;
    voltarCapaPadrao = true;
    banner.src = PADRAO_CAPA;
});

// Salvar: manda tudo de uma vez
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nome = campoNome.value.trim();
    if (!nome) return alert("Informe um nome de usuário");

    const dados = new FormData();
    dados.append("acao", "salvar");
    dados.append("nome", nome);
    dados.append("descricao", campoBio.value.trim());
    if (novaFoto) dados.append("foto", novaFoto);
    if (novaCapa) dados.append("capa", novaCapa);
    if (voltarFotoPadrao) dados.append("padrao_foto", "1");
    if (voltarCapaPadrao) dados.append("padrao_banner", "1");

    botaoSalvar.disabled = true;           // o envio das imagens pode levar alguns segundos
    try {
        const r = await fetch(API_PERFIL, { method: "POST", body: dados });
        const resposta = await r.json();
        if (r.status === 401) { location.href = "login.html"; return; }
        if (!r.ok) throw new Error(resposta.erro || "Erro ao salvar");
        location.href = "usuario.html";
    } catch (err) {
        alert(err.message);
        botaoSalvar.disabled = false;
    }
});