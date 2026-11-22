import { buscarSugestoes, publicarSugestao, excluirSugestao, alternarCurtida } from "./banco.js";

await sessaoPronta;   // garante que usuarioAtual já existe antes de desenhar os cards

const lista = document.getElementById("lista-sugestoes");   // só o contêiner dos cards
const contador = document.getElementById("contador");
const formulario = document.getElementById("form-sugestao");

// Ações que os cards chamam quando o usuário clica nos botões
const acoes = {
    async aoCurtir(id) {
        try {
            await alternarCurtida(id);   // servidor já inverte curtidas/curtiuEu
        } catch (e) {
            alert(e.message);
        }
        await desenharLista();
    },
    async aoExcluir(id) {
        if (!confirm("Excluir esta sugestão?")) return;
        try {
            await excluirSugestao(id);
        } catch (e) {
            alert(e.message);
        }
        await desenharLista();
    }
};

const campoBusca   = document.querySelector(".campo-busca input");
const botaoFiltros = document.querySelector(".botao-filtros");
let todasSugestoes = [];   // lista completa vinda do servidor

const estado = { ordem: "recentes", categorias: new Set() };   // categorias vazias = todas

// Tira acentos e maiúsculas: "Gráficos" → "graficos"
function normalizarTexto(texto) {
    return (texto || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// Data de criação em milissegundos (inválida vira 0)
function emMs(s) {
    const ms = new Date(s.createdAt ?? s.data).getTime();
    return Number.isNaN(ms) ? 0 : ms;
}

// Aplica busca + categorias
function filtrar(sugestoes) {
    const palavras = normalizarTexto(campoBusca.value.trim()).split(/\s+/).filter(Boolean);
    return sugestoes.filter((s) => {
        if (estado.categorias.size && !estado.categorias.has(normalizarTexto(s.categoria))) return false;
        const texto = normalizarTexto(`${s.titulo} ${s.descricao} ${s.autor} ${s.categoria}`);
        return palavras.every((p) => texto.includes(p));
    });
}

// Recentes (padrão) ou Mais curtidas (empate: a mais nova primeiro)
function ordenar(sugestoes) {
    const copia = [...sugestoes];
    if (estado.ordem === "curtidas") {
        return copia.sort((a, b) => b.curtidas - a.curtidas || emMs(b) - emMs(a));
    }
    return copia.sort((a, b) => emMs(b) - emMs(a));
}

// Desenha os cards a partir da lista que já está na memória (sem ir ao servidor)
function desenharCards() {
    const visiveis = ordenar(filtrar(todasSugestoes));
    lista.replaceChildren();
    visiveis.forEach((s) => lista.append(CartaoSugestao(s, acoes)));

    if (todasSugestoes.length === 0) {
        lista.append(el("p", "vazio", "Ainda não há sugestões. Seja o primeiro!"));
    } else if (visiveis.length === 0) {
        lista.append(el("p", "vazio", "Nenhuma sugestão encontrada com essa busca ou esses filtros."));
    }

    const n = visiveis.length;
    contador.textContent = n + (n === 1 ? " publicação" : " publicações");
}

// Busca no servidor e redesenha (ao abrir a página e depois de curtir/excluir/publicar)
async function desenharLista() {
    todasSugestoes = await buscarSugestoes();
    desenharCards();
}

campoBusca.addEventListener("input", desenharCards);

/* ---------- PAINEL DE FILTROS (o HTML já está no sugestoes.html) ---------- */

const painelFiltros = document.getElementById("painel-filtros");
const selo = document.getElementById("filtros-contagem");

// Alguns navegadores lembram os campos marcados ao recarregar: lê o estado real do HTML
estado.ordem = painelFiltros.querySelector('input[name="filtro-ordem"]:checked').value;
painelFiltros.querySelectorAll('input[name="filtro-categoria"]:checked')
    .forEach((c) => estado.categorias.add(c.value));

function aplicar() {
    const ativos = (estado.ordem !== "recentes" ? 1 : 0) + estado.categorias.size;
    selo.textContent = ativos;
    selo.hidden = ativos === 0;
    desenharCards();
}

// Ordenação (radios)
painelFiltros.querySelectorAll('input[name="filtro-ordem"]').forEach((r) =>
    r.addEventListener("change", () => { estado.ordem = r.value; aplicar(); })
);

// Categorias (checkboxes)
painelFiltros.querySelectorAll('input[name="filtro-categoria"]').forEach((c) =>
    c.addEventListener("change", () => {
        if (c.checked) estado.categorias.add(c.value);
        else estado.categorias.delete(c.value);
        aplicar();
    })
);

// Limpar filtros
document.getElementById("filtros-limpar").addEventListener("click", () => {
    estado.ordem = "recentes";
    estado.categorias.clear();
    painelFiltros.querySelector('input[value="recentes"]').checked = true;
    painelFiltros.querySelectorAll('input[type="checkbox"]').forEach((c) => (c.checked = false));
    aplicar();
});

// Abrir / fechar
function fecharFiltros() {
    painelFiltros.hidden = true;
    botaoFiltros.setAttribute("aria-expanded", "false");
}

botaoFiltros.addEventListener("click", () => {
    painelFiltros.hidden = !painelFiltros.hidden;
    botaoFiltros.setAttribute("aria-expanded", String(!painelFiltros.hidden));
});

document.addEventListener("click", (e) => {
    if (!painelFiltros.hidden && !painelFiltros.contains(e.target) && !botaoFiltros.contains(e.target)) {
        fecharFiltros();
    }
});
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") fecharFiltros();
});

aplicar();   // deixa a bolinha do botão no estado certo ao abrir a página

// Formulário "Nova sugestão"
formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();                       // não recarrega a página
    const f = new FormData(formulario);
    const titulo = f.get("titulo").trim();
    const descricao = f.get("descricao").trim();
    if (!titulo || !descricao) return;             // campos vazios: ignora

    const rotulos = { jogabilidade: "Jogabilidade", personagens: "Personagens",
                    interface: "Interface", graficos: "Gráficos", outros: "Outros" };

    try {
        await publicarSugestao({
            titulo,
            descricao,
            categoria: rotulos[f.get("categoria")],
            icon: ["atck", "def", "mov", "mp", "set"][Number(f.get("icone")) - 1] || "logo"
        });
    } catch (e) {
        alert(e.message);
        return;
    }

    formulario.reset();
    formulario.querySelectorAll(".campo small").forEach((s) => {
        s.textContent = "0/" + s.textContent.split("/")[1];   // zera os contadores
    });
    await desenharLista();
});

desenharLista();
