// Cliente da API de sugestões.
// O JS não fala com o PHP diretamente: ele chama o endpoint
// src/api/sugestoes.php, que por sua vez usa src/db/funcoes.php no servidor.
//
// Todas as funções são assíncronas (retornam Promise) — use await.

const API = "../../src/api/sugestoes.php";

async function chamarApi(opcoes) {
    const r = await fetch(API, opcoes);
    const dados = await r.json();
    if (!r.ok) throw new Error(dados.erro || "Erro na requisição");
    return dados;
}

// Documentos antigos usam "icon"/"createdAt"; os novos usam "icone"/"data".
// Esta função deixa tudo no formato que o card espera.
function normalizarSugestao(s) {
    return {
        ...s,
        icon: s.icon ?? s.icone ?? "logo",
        data: (s.data ?? (s.createdAt ?? "").slice(0, 10)),
        curtidas: s.curtidas ?? 0,
        curtiuEu: !!s.curtiuEu
    };
}

// GET: devolve todas as sugestões (ou uma só, se passar o id), mais novas primeiro
export async function buscarSugestoes(id = null) {
    const url = id ? `${API}?id=${encodeURIComponent(id)}` : API;
    const r = await fetch(url);
    const dados = await r.json();
    if (!r.ok) throw new Error(dados.erro || "Erro ao buscar sugestões");
    if (id) return dados ? normalizarSugestao(dados) : null;
    return dados.map(normalizarSugestao)
                .sort((a, b) => b.data.localeCompare(a.data));
}

// POST: publica uma sugestão nova
// dados: { titulo, descricao, categoria, icone, autor, uid, data }
export async function publicarSugestao(dados) {
    return chamarApi({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao: "publicar", dados })
    });
}

// POST: curtir / descurtir (o servidor inverte o estado)
export async function alternarCurtida(id) {
    return chamarApi({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao: "curtir", id })
    });
}

// DELETE: exclui uma sugestão
export async function excluirSugestao(id) {
    const r = await fetch(`${API}?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    const dados = await r.json();
    if (!r.ok) throw new Error(dados.erro || "Erro ao excluir");
    return dados;
}
