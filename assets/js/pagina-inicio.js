/* =====================================================================
   pagina-inicio.js  —  monta os cards da TELA INICIAL (src/tabs/index.html)
   ---------------------------------------------------------------------
   A tela tem 3 ÁREAS, e cada uma recebe um tipo de card:

     #destaque          → CartaoDestaque    (update mais novo, card grande)
     #cartoes-updates   → CartaoUpdate      (os outros updates)
     #cartao-sugestao   → CartaoSugestao    (a sugestão mais curtida)

   Cada área tem a sua própria função. Assim, se uma delas der erro
   (ex.: banco fora do ar), as outras continuam funcionando.

   Usa: dados.js (updates), banco.js (sugestões) e cartoes.js (os cards).
   Este arquivo é um MÓDULO (type="module") por causa do import abaixo.
   ===================================================================== */

import { buscarSugestoes, alternarCurtida } from "./banco.js";


/* ---------- ÁREA 1: card grande (update mais novo) ---------- */
function montarDestaque(updates) {
    const area = document.getElementById("destaque");
    const maisNovo = updates[0];                       // a lista já vem do mais novo ao mais antigo
    if (maisNovo) area.replaceWith(CartaoDestaque(maisNovo));
}


/* ---------- ÁREA 2: cards de update (todos menos o destaque) ---------- */
function montarUpdates(updates) {
    const area = document.getElementById("cartoes-updates");
    const outros = updates.slice(1);                   // pula o 1º (ele já virou destaque)

    area.replaceChildren();
    outros.forEach((u) => area.append(CartaoUpdate(u)));

    if (outros.length === 0) {
        area.append(el("p", "vazio", "Nenhum outro update por enquanto."));
    }
}


/* ---------- ÁREA 3: sugestão mais curtida ---------- */
// Ações do card. Nesta tela só dá para curtir (não tem aoExcluir,
// então o botão de excluir nem aparece).
const acoesSugestao = {
    async aoCurtir(id) {
        try {
            await alternarCurtida(id);
        } catch (e) {
            alert(e.message);
        }
        await montarSugestaoMaisCurtida();             // redesenha: a mais curtida pode ter mudado
    }
};

async function montarSugestaoMaisCurtida() {
    const area = document.getElementById("cartao-sugestao");

    try {
        const todas = await buscarSugestoes();         // vem do banco (PHP)
        area.replaceChildren();

        if (todas.length === 0) {
            area.append(el("p", "vazio", "Ainda não há sugestões. Seja o primeiro!"));
            return;
        }

        // Escolhe a de mais curtidas. Em caso de empate, fica a mais nova
        // (a lista já vem das mais novas para as mais antigas).
        const maisCurtida = todas.reduce((melhor, atual) =>
            atual.curtidas > melhor.curtidas ? atual : melhor
        );
        area.append(CartaoSugestao(maisCurtida, acoesSugestao));

    } catch (e) {
        area.replaceChildren(el("p", "vazio", "Não foi possível carregar a sugestão agora."));
    }
}


/* ---------- INÍCIO ---------- */
const updates = buscarUpdates();                       // vem de dados.js
montarDestaque(updates);
montarUpdates(updates);
montarSugestaoMaisCurtida();
