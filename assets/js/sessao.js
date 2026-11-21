const API_AUTH = "../../src/api/auth.php";

let usuarioAtual = null;   // { id, nome, fotoPerfil, admin } depois de carregar

async function carregarUsuario() {
    const r = await fetch(API_AUTH);
    if (!r.ok) {
        location.href = "login.html";      // não logado → volta para o login
        return new Promise(() => {});      // pausa o resto enquanto redireciona
    }
    usuarioAtual = await r.json();
    return usuarioAtual;
}

// Nas páginas internas, confere o login ao abrir. As telas de login/cadastro
// têm <body class="auth"> e ficam de fora.
const sessaoPronta = document.body.classList.contains("auth")
    ? Promise.resolve(null)
    : carregarUsuario();

// Botões "Sair" (menu lateral e página de usuário)
document.querySelectorAll(".botao-sair, .acao-perigo").forEach((b) => {
    b.addEventListener("click", async () => {
        await fetch(API_AUTH, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ acao: "sair" })
        });
        location.href = "login.html";
    });
});