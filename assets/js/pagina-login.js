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
        try {
            await enviarAuth({ acao: "login", email: f.get("email").trim(), senha: f.get("senha") });
            location.href = "index.html";
        } catch (err) {
            alert(err.message);
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
        }
    });
}
