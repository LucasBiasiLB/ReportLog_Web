async function enviarAuth(corpo) {
    const r = await fetch(API_AUTH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpo)
    });
    const dados = await r.json();
    if (!r.ok) throw new Error(dados.erro || "Erro");
    return dados;
}

const formLogin = document.getElementById("form-login");
if (formLogin) {
    formLogin.addEventListener("submit", async (e) => {
        e.preventDefault();
        const f = new FormData(formLogin);
        const pronto = botaoCarregando(e.submitter || formLogin.querySelector('button[type="submit"]'), "Entrando");
        try {
            await enviarAuth({ acao: "login", email: f.get("email").trim(), senha: f.get("senha") });
            location.href = "index.html";
        } catch (err) {
            alert(err.message);
            pronto();
        }
    });
}

const formCriar = document.getElementById("form-criar-conta");
if (formCriar) {
    formCriar.addEventListener("submit", async (e) => {
        e.preventDefault();
        const f = new FormData(formCriar);
        if (f.get("senha") !== f.get("confirmar")) return alert("As senhas não são iguais");
        if (!f.get("termos")) return alert("Aceite os termos para continuar");
        const pronto = botaoCarregando(e.submitter || formCriar.querySelector('button[type="submit"]'), "Criando conta");
        try {
            await enviarAuth({
                acao: "registrar",
                usuario: f.get("usuario").trim(),
                email: f.get("email").trim(),
                senha: f.get("senha")
            });
            location.href = "index.html";
        } catch (err) {
            alert(err.message);
            pronto();
        }
    });
}

// "Esqueci minha senha" (só existe na tela de login)
const linkRecuperar = document.getElementById("link-recuperar");
const caixaRecuperar = document.getElementById("recuperar-senha");
const formRecuperar = document.getElementById("form-recuperar");

if (linkRecuperar && caixaRecuperar && formRecuperar) {
    linkRecuperar.addEventListener("click", (e) => {
        e.preventDefault();
        formLogin.hidden = true;
        caixaRecuperar.hidden = false;
    });

    document.getElementById("link-voltar-login").addEventListener("click", (e) => {
        e.preventDefault();
        caixaRecuperar.hidden = true;
        formLogin.hidden = false;
    });

    formRecuperar.addEventListener("submit", async (e) => {
        e.preventDefault();
        const f = new FormData(formRecuperar);
        const pronto = botaoCarregando(e.submitter || formRecuperar.querySelector('button[type="submit"]'), "Enviando");
        try {
            await enviarAuth({ acao: "recuperar", email: f.get("email").trim() });
            alert("Se este e-mail estiver cadastrado, você receberá um link para redefinir a senha.");
            formLogin.hidden = false;
            caixaRecuperar.hidden = true;
            pronto();
        } catch (err) {
            alert(err.message);
            pronto();
        }
    });
}
