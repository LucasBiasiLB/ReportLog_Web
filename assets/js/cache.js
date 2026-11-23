const CACHE_PREFIXO = "reportlog:v1:";   // mude o v1 para v2 se um dia mudar o formato dos dados

function cacheLer(chave) {
    try {
        const bruto = localStorage.getItem(CACHE_PREFIXO + chave);
        return bruto ? JSON.parse(bruto) : null;
    } catch {
        return null;                      // armazenamento bloqueado ou dado corrompido
    }
}

function cacheGravar(chave, dados) {
    try {
        localStorage.setItem(CACHE_PREFIXO + chave, JSON.stringify(dados));
    } catch {
        /* cheio ou bloqueado: segue sem cache */
    }
}

// Chamar ao entrar e ao sair da conta
function cacheLimparTudo() {
    try {
        Object.keys(localStorage)
            // "rascunhos-update" fica de fora: é rascunho do admin, não cache de leitura
            .filter((k) => k.startsWith(CACHE_PREFIXO) && !k.includes("rascunhos-update"))
            .forEach((k) => localStorage.removeItem(k));
    } catch { /* ignora */ }
}

/* ---------- RODINHA ---------- */

function mostrarRodinha(alvo) {
    if (alvo.querySelector(":scope > .carregando")) return;
    const caixa = document.createElement("div");
    caixa.className = "carregando";
    caixa.setAttribute("role", "status");
    caixa.setAttribute("aria-label", "Carregando");
    const roda = document.createElement("span");
    roda.className = "rodinha";
    caixa.append(roda);
    alvo.append(caixa);
}

function tirarRodinha(alvo) {
    alvo.querySelector(":scope > .carregando")?.remove();
}

/* ---------- O CORAÇÃO DO SISTEMA ----------
   carregarComCache(chave, buscar, mostrar, alvo)
     chave   → nome do que está sendo guardado ("sugestoes", "updates", "usuario")
     buscar  → função async que consulta o servidor e devolve os dados crus
     mostrar → função que desenha os dados na tela (recebe os dados)
     alvo    → elemento onde a rodinha/erro aparece quando não há nada salvo     */
async function carregarComCache(chave, buscar, mostrar, alvo = null) {
    const salvo = cacheLer(chave);
    const tinhaSalvo = salvo !== null;

    if (tinhaSalvo) mostrar(salvo);                 // instantâneo, sem rodinha
    else if (alvo) mostrarRodinha(alvo);

    try {
        const novo = await buscar();
        cacheGravar(chave, novo);
        if (alvo) tirarRodinha(alvo);
        // só redesenha se não havia nada na tela ou se os dados mudaram
        if (!tinhaSalvo || JSON.stringify(novo) !== JSON.stringify(salvo)) mostrar(novo);
        return novo;
    } catch (erro) {
        if (alvo) tirarRodinha(alvo);
        if (tinhaSalvo) {
            console.warn("Não foi possível atualizar '" + chave + "'; mantendo o salvo.", erro);
            return salvo;
        }
        if (alvo) {
            const msg = document.createElement("p");
            msg.className = "vazio";
            msg.textContent = "Não foi possível carregar. Tente novamente.";
            alvo.append(msg);
        }
        throw erro;
    }
}

function mostrarRodinhaTela() {
    if (document.querySelector(".carregando-tela")) return;
    const tela = document.createElement("div");
    tela.className = "carregando-tela";
    tela.setAttribute("role", "status");
    tela.setAttribute("aria-label", "Carregando");
    const roda = document.createElement("span");
    roda.className = "rodinha";
    tela.append(roda);
    document.body.append(tela);
}

function tirarRodinhaTela() {
    document.querySelector(".carregando-tela")?.remove();
}