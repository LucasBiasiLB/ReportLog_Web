// Abre e fecha o menu lateral em telas pequenas
const botaoMenu = document.getElementById("botao-menu");
const menuLateral = document.getElementById("menu-lateral");

if (botaoMenu && menuLateral) {
    botaoMenu.addEventListener("click", () => {
        const aberto = menuLateral.classList.toggle("aberto");
        botaoMenu.setAttribute("aria-expanded", aberto);
    });
}

// Contador de caracteres do formulário de sugestões
document.querySelectorAll(".campo input[maxlength], .campo textarea[maxlength]").forEach((campo) => {
    const contador = campo.parentElement.querySelector("small");
    if (!contador) return;
    campo.addEventListener("input", () => {
        contador.textContent = campo.value.length + "/" + campo.maxLength;
    });
});
