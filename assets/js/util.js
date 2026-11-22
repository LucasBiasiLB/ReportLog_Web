// Cria um elemento: el("div", "minha-classe", "texto")
function el(tag, classe, texto) {
    const e = document.createElement(tag);
    if (classe) e.className = classe;
    if (texto !== undefined) e.textContent = texto;
    return e;
}

// Cria um ícone SVG que usa o "sprite" (<symbol id="i-nome">) da página
function icone(nome) {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("class", "icone");
    const uso = document.createElementNS(ns, "use");
    uso.setAttribute("href", "#i-" + nome);
    svg.appendChild(uso);
    return svg;
}

// "2026-11-08" → "08/11/2026"
function formatarData(iso) {
    const [ano, mes, dia] = iso.split("-");
    return dia + "/" + mes + "/" + ano;
}

// "1.2.0" ou "v1.2.0" → "v1.2.0"
function versaoComV(versao) {
    return "v" + String(versao || "").replace(/^v/i, "");
}
