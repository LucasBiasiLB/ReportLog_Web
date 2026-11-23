import { buscarUpdatesBruto, normalizarUpdates, excluirUpdate } from "./banco.js";

await sessaoPronta;   // garante que usuarioAtual já existe antes de desenhar os cards

const lista = document.getElementById("lista-updates");   // só o contêiner dos cards
const contador = document.getElementById("contador");

// Ações que cada linha chama quando o usuário clica
const acoes = {
    aoAbrir(dados) {
        abrirVerUpdate(dados);      // vem do janelas-update.js
    },
    async aoExcluir(id) {
        if (!confirm("Excluir este update? Essa ação não pode ser desfeita.")) return;
        try {
            await excluirUpdate(id);
        } catch (e) {
            alert(e.message);
            return;
        }
        await recarregar();
    }
};

let updatesCrus = [];

// Desenha uma linha para cada update (do mais novo para o mais antigo)
function mostrarUpdates(crus) {
    updatesCrus = crus;
    const todos = normalizarUpdates(crus);

    lista.replaceChildren();
    todos.forEach((u) => lista.append(CartaoUpdateLinha(u, acoes)));

    if (todos.length === 0) {
        lista.append(el("p", "vazio", "Nenhuma atualização publicada ainda."));
    }
    contador.textContent = todos.length + (todos.length === 1 ? " publicada" : " publicadas");
}

// Busca no servidor, guarda no cache e redesenha (depois de excluir)
async function recarregar() {
    const crus = await buscarUpdatesBruto();
    cacheGravar("updates", crus);
    mostrarUpdates(crus);
}

// Se o login mudou (ex.: virou admin), refaz as linhas (a lixeira é só do admin)
document.addEventListener("usuario-atualizado", () => mostrarUpdates(updatesCrus));

carregarComCache("updates", buscarUpdatesBruto, mostrarUpdates, lista).catch(console.error);