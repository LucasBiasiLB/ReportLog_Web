await sessaoPronta;   // usuarioAtual vem do cache (ou do servidor, se não houver nada salvo)

const PADRAO_AVATAR = "/ReportLog_Web/assets/image/avatar.png";
const PADRAO_BANNER = "/ReportLog_Web/assets/image/banner.png";

function mostrarPerfil() {
    document.querySelector(".perfil-nome").textContent = usuarioAtual.nome;
    document.querySelector(".perfil-bio").textContent =
        usuarioAtual.descricao || "Você ainda não escreveu uma descrição.";
    document.querySelector(".perfil-avatar").src = usuarioAtual.fotoPerfil || PADRAO_AVATAR;
    document.querySelector(".perfil-banner").src = usuarioAtual.fotoCapa || PADRAO_BANNER;
}

mostrarPerfil();
document.addEventListener("usuario-atualizado", mostrarPerfil);   // o servidor confirmou algo diferente