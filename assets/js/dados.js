// Quem está logado (de mentira)
const usuarioAtual = {
    id: "u1",
    nome: "Usuário",
    admin: false          // mude para true para testar o botão de excluir em tudo
};

// ---------- UPDATES (tela inicial) ----------
// O primeiro da lista é o "destaque" (card grande); os outros viram cards pequenos.
const updates = [
    {
        id: "up3",
        versao: "v0.0.3",
        titulo: "Novo saque",
        descricao: "Saque viagem e ajustes na física da bola.",
        data: "2026-11-14",
        imagem: ""        // coloque o caminho de uma imagem, ex: "../assets/image/update.png"
    },
    {
        id: "up2",
        versao: "v0.0.2",
        titulo: "Menu reformulado",
        descricao: "Interface nova e mais rápida.",
        data: "2026-11-10",
        imagem: ""
    },
    {
        id: "up1",
        versao: "v0.0.0",
        titulo: "App novo",
        descricao: "O começo de tudo",
        data: "2026-11-08",
        imagem: ""
    }
];

// ---------- SUGESTÕES ----------
// "icone" é o nome do ícone (ver ICONES_SUGESTAO no fim do arquivo)
const sugestoes = [
    {
        id: "s1",
        autor: "Ana",
        uid: "u2",
        data: "2026-11-12",
        categoria: "Personagens",
        titulo: "Adicionar novos personagens",
        descricao: "Seria legal ter jogadores com habilidades diferentes, como um levantador rápido.",
        icone: "usuario",
        curtidas: 12,
        curtiuEu: false
    },
    {
        id: "s2",
        autor: "Usuário",
        uid: "u1",          // igual ao usuarioAtual.id → aparece o botão de excluir
        data: "2026-11-13",
        categoria: "Interface",
        titulo: "Modo escuro nas configurações",
        descricao: "Um botão para trocar o tema e diminuir o brilho da tela durante a partida.",
        icone: "ideia",
        curtidas: 5,
        curtiuEu: true
    },
    {
        id: "s3",
        autor: "Pedro",
        uid: "u3",
        data: "2026-11-15",
        categoria: "Jogabilidade",
        titulo: "Partidas em dupla online",
        descricao: "Poder jogar com um amigo no mesmo time, cada um controlando um jogador.",
        icone: "mais",
        curtidas: 27,
        curtiuEu: false
    }
];

// Ícones que o formulário oferece (o valor do radio 1..5 vira um destes)
const ICONES_SUGESTAO = ["ideia", "usuario", "info", "imagem", "mais"];

/* ---------------------------------------------------------------------
   FUNÇÕES (é aqui que o Firebase vai entrar depois)
   --------------------------------------------------------------------- */

// Devolve os updates (do mais novo para o mais antigo)
function buscarUpdates() {
    return [...updates].sort((a, b) => b.data.localeCompare(a.data));
}

// Devolve as sugestões (mais recentes primeiro)
function buscarSugestoes() {
    return [...sugestoes].sort((a, b) => b.data.localeCompare(a.data));
}

// Cria uma sugestão nova
function publicarSugestao({ titulo, descricao, categoria, icone }) {
    const hoje = new Date().toISOString().slice(0, 10);   // "AAAA-MM-DD"
    const nova = {
        id: "s" + Date.now(),
        autor: usuarioAtual.nome,
        uid: usuarioAtual.id,
        data: hoje,
        categoria,
        titulo,
        descricao,
        icone,
        curtidas: 0,
        curtiuEu: false
    };
    sugestoes.push(nova);
    return nova;
}

// Curtir / descurtir. Devolve a sugestão atualizada.
function alternarCurtida(id) {
    const s = sugestoes.find((x) => x.id === id);
    if (!s) return null;
    s.curtiuEu = !s.curtiuEu;
    s.curtidas += s.curtiuEu ? 1 : -1;
    return s;
}

// Remove uma sugestão
function excluirSugestao(id) {
    const i = sugestoes.findIndex((x) => x.id === id);
    if (i >= 0) sugestoes.splice(i, 1);
}
