const API_AUTH = "../../src/api/auth.php";

let usuarioAtual = null;   // { id, nome, descricao, fotoPerfil, fotoCapa, admin }

// Pergunta ao servidor quem está logado. 401 → limpa o cache e volta ao login
async function buscarUsuario() {
    const r = await fetch(API_AUTH);
    if (r.status === 401) {
        cacheLimparTudo();
        location.href = "login.html";
        return new Promise(() => {});      // pausa o resto enquanto redireciona
    }
    if (!r.ok) throw new Error("Não foi possível carregar o usuário");
    return r.json();
}

async function carregarUsuario() {
    const salvo = cacheLer("usuario");

    if (salvo) {
        usuarioAtual = salvo;              // a página abre na hora
        buscarUsuario()                    // confirma no servidor em segundo plano
            .then((novo) => {
                cacheGravar("usuario", novo);
                if (JSON.stringify(novo) !== JSON.stringify(usuarioAtual)) {
                    usuarioAtual = novo;
                    document.dispatchEvent(new CustomEvent("usuario-atualizado"));
                }
            })
            .catch((erro) => console.warn("Não foi possível confirmar o login:", erro));
        return usuarioAtual;
    }

    mostrarRodinhaTela();                  // nada salvo: espera o servidor
    try {
        usuarioAtual = await buscarUsuario();
    } finally {
        tirarRodinhaTela();
    }
    cacheGravar("usuario", usuarioAtual);
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
        try {
            await fetch(API_AUTH, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ acao: "sair" })
            });
        } finally {
            cacheLimparTudo();             // o próximo usuário não pode ver nada deste
            location.href = "login.html";
        }
    });
});