import { buscarUpdates } from "./banco.js";

await sessaoPronta;   // garante que usuarioAtual já existe antes de desenhar os cards

const lista = document.getElementById("lista-updates");   // só o contêiner dos cards
const contador = document.getElementById("contador");

// Ações que cada linha chama quando o usuário clica
const acoes = {
    aoAbrir(dados) {
        abrirVerUpdate(dados);      // vem do janelas-update.js
    },
    aoExcluir(id) {
        // TODO: chamar a API para excluir (o updates.php ainda só aceita GET)
        alert("Visual pronto! Falta ligar o excluir ao banco.");
    }
};

// Limpa a lista e desenha uma linha para cada update (do mais novo para o mais antigo)
async function desenharLista() {
    let todos = [];
    try {
        todos = await buscarUpdates();
    } catch (e) {
        lista.replaceChildren(el("p", "vazio", "Não foi possível carregar os updates."));
        console.error(e);
        return;
    }

    lista.replaceChildren();
    todos.forEach((u) => lista.append(CartaoUpdateLinha(u, acoes)));

    if (todos.length === 0) {
        lista.append(el("p", "vazio", "Nenhuma atualização publicada ainda."));
    }
    contador.textContent = todos.length + (todos.length === 1 ? " publicada" : " publicadas");
}

desenharLista();
