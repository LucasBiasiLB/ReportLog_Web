await sessaoPronta;   // usuarioAtual já vem do login, com nome, bio, foto e banner

const PADRAO_AVATAR = "/ReportLog_Web/assets/image/avatar.png";
const PADRAO_BANNER = "/ReportLog_Web/assets/image/banner.png";

document.querySelector(".perfil-nome").textContent = usuarioAtual.nome;
document.querySelector(".perfil-bio").textContent =
    usuarioAtual.descricao || "Você ainda não escreveu uma descrição.";
if (usuarioAtual.fotoPerfil) document.querySelector(".perfil-avatar").src = usuarioAtual.fotoPerfil;
if (usuarioAtual.fotoCapa)   document.querySelector(".perfil-banner").src = usuarioAtual.fotoCapa;

