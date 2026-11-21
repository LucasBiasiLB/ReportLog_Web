const API = "/ReportLog_Web/src/api/sugestoes.php";

async function chamarApi(opcoes = {}, url = API) {
    const r = await fetch(url, opcoes);
    const dados = await r.json();
    if (r.status === 401) {
        location.href = "login.html";
        return new Promise(() => {});          // pausa enquanto redireciona
    }
    if (!r.ok) throw new Error(dados.erro || "Erro na requisição");
    return dados;
}

function normalizarSugestao(s) {
    const curtidoPor = Array.isArray(s.curtidoPor) ? s.curtidoPor : [];
    return {
        ...s,
        icon: s.icon ?? s.icone ?? "logo",
        data: (s.data ?? (s.createdAt ?? "").slice(0, 10)),
        curtidoPor,
        curtidas: curtidoPor.length,
        curtiuEu: curtidoPor.includes(usuarioAtual.id)
    };
}

// GET: todas as sugestões (ou uma só, se passar o id), mais novas primeiro
export async function buscarSugestoes(id = null) {
    const url = id ? `${API}?id=${encodeURIComponent(id)}` : API;
    const dados = await chamarApi({}, url);
    if (id) return dados ? normalizarSugestao(dados) : null;
    return dados.map(normalizarSugestao)
                .sort((a, b) => b.data.localeCompare(a.data));
}

// POST: publica uma sugestão nova
// dados: { titulo, descricao, categoria, icon }  (uid, autor e data o servidor define)
export async function publicarSugestao(dados) {
    return chamarApi({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao: "publicar", dados })
    });
}

// POST: curtir / descurtir (o servidor sabe quem é pelo login)
export async function alternarCurtida(id) {
    return chamarApi({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao: "curtir", id })
    });
}

// DELETE: exclui uma sugestão
export async function excluirSugestao(id) {
    return chamarApi({ method: "DELETE" }, `${API}?id=${encodeURIComponent(id)}`);
}
// _____________________________________________________________________________________________________________________________________________

// UPDATES visualização


const API_UPDATES = "/ReportLog_Web/src/api/updates.php";

// O Firestore usa descricaoCurta / imagemDestaque / dataAtualizacao;
// os cards esperam descricao / imagem / data ("AAAA-MM-DD").
function normalizarUpdate(u) {
    const quando = u.dataAtualizacao ?? u.createdAt ?? "";
    return {
        ...u,
        descricao: u.descricaoCurta ?? u.descricao ?? "",
        imagem: u.imagemDestaque ?? u.imagem ?? "",
        data: quando ? new Date(quando).toLocaleDateString("sv-SE") : "",   // sv-SE dá AAAA-MM-DD no fuso local
        quando
    };
}

// GET: updates publicados, do mais novo para o mais antigo
export async function buscarUpdates() {
    const dados = await chamarApi({}, API_UPDATES);
    return dados.map(normalizarUpdate)
                .sort((a, b) => b.quando.localeCompare(a.quando));
}