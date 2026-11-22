const API = "/ReportLog_Web/src/api/sugestoes.php";
const API_UPDATES = "/ReportLog_Web/src/api/updates.php";

async function chamarApi(opcoes = {}, url = API) {
    const r = await fetch(url, opcoes);
    const dados = await r.json();
    if (r.status === 401) {
        cacheLimparTudo();
        location.href = "login.html";
        return new Promise(() => {});          // pausa enquanto redireciona
    }
    if (!r.ok) throw new Error(dados.erro || "Erro na requisição");
    return dados;
}

/* ---------- SUGESTÕES ---------- */

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

// GET: dados CRUS do servidor (é isto que vai para o cache)
export function buscarSugestoesBruto() {
    return chamarApi();
}

// Deixa os dados no formato que os cards esperam, mais novas primeiro.
// Roda a cada desenho, porque curtiuEu depende de quem está logado.
export function normalizarSugestoes(lista) {
    return lista.map(normalizarSugestao)
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

/* ---------- UPDATES ---------- */

// Converte qualquer data em milissegundos (data inválida vira 0 e vai para o fim)
function paraMs(valor) {
    const ms = new Date(valor).getTime();
    return Number.isNaN(ms) ? 0 : ms;
}

function normalizarUpdate(u) {
    const quando = u.dataAtualizacao ?? u.createdAt ?? "";
    return {
        ...u,
        versao: "v" + String(u.versao ?? "").replace(/^v/i, ""),   // "1.2.0" → "v1.2.0"
        descricao: u.descricaoCurta ?? u.descricao ?? "",
        imagem: u.imagemDestaque ?? u.imagem ?? "",
        novidades: Array.isArray(u.novidades) ? u.novidades : [],
        conteudo: u.conteudoDetalhado ?? u.conteudo ?? "",
        data: paraMs(quando) ? new Date(quando).toLocaleDateString("sv-SE") : "",
        quando
    };
}

// GET: updates publicados, dados CRUS do servidor
export function buscarUpdatesBruto() {
    return chamarApi({}, API_UPDATES);
}

// Do mais novo para o mais antigo
export function normalizarUpdates(lista) {
    return lista.map(normalizarUpdate)
                .sort((a, b) =>
                    paraMs(b.quando) - paraMs(a.quando) ||          // 1º: dataAtualizacao
                    paraMs(b.createdAt) - paraMs(a.createdAt));     // empate: o criado por último
}