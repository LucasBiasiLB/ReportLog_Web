await sessaoPronta;   // garante que usuarioAtual já existe antes de desenhar os cards

const lista = document.getElementById("lista-sugestoes");   // só o contêiner dos cards
const contador = document.getElementById("contador");

/* ---------- DADOS DE EXEMPLO (só a parte visual) ----------
   Depois, trocar por as sugestões reais do usuário:
       buscarSugestoesBruto() + normalizarSugestoes()  (vêm do banco.js)
       e filtrar com:  s.uid === usuarioAtual.id
   Campos que o card usa: id, data, categoria, titulo, descricao, icon, curtidas
   "icon" é o nome de um ícone do icons.js: atck, def, mov, mp, set ou logo.  */
const sugestoesExemplo = [
    {
        id: "s4",
        data: "2026-11-18",
        categoria: "Jogabilidade",
        titulo: "Partidas em dupla online",
        descricao: "Poder jogar com um amigo no mesmo time, cada um controlando um jogador diferente da quadra.",
        icon: "mov",
        curtidas: 27
    },
    {
        id: "s3",
        data: "2026-11-15",
        categoria: "Interface",
        titulo: "Modo escuro nas configurações",
        descricao: "Um botão para trocar o tema e diminuir o brilho da tela durante a partida.",
        icon: "set",
        curtidas: 12
    },
    {
        id: "s2",
        data: "2026-11-12",
        categoria: "Personagens",
        titulo: "Adicionar novos personagens",
        descricao: "Seria legal ter jogadores com habilidades diferentes, como um levantador mais rápido e um líbero.",
        icon: "atck",
        curtidas: 5
    },
    {
        id: "s1",
        data: "2026-11-09",
        categoria: "Gráficos",
        titulo: "Mais opções de uniforme",
        descricao: "Cores e estampas diferentes para os times escolherem antes da partida.",
        icon: "def",
        curtidas: 0
    }
];

// Ações que cada linha chama quando o usuário clica
const acoes = {
    aoAbrir(dados) {
        // leva para a tela de Sugestões, já apontando para esta sugestão
        location.href = "sugestoes.html#" + dados.id;
    },
    aoExcluir(id) {
        // TODO: chamar a API para excluir (excluirSugestao, do banco.js)
        alert("Visual pronto! Falta ligar o excluir ao banco.");
    }
};

// Desenha uma linha para cada sugestão (da mais nova para a mais antiga)
function mostrarSugestoes(todas) {
    lista.replaceChildren();
    todas.forEach((s) => lista.append(CartaoSugestaoLinha(s, acoes)));

    if (todas.length === 0) {
        lista.append(el("p", "vazio", "Você ainda não fez nenhuma sugestão."));
    }
    contador.textContent = todas.length + (todas.length === 1 ? " enviada" : " enviadas");
}

mostrarSugestoes(sugestoesExemplo);
