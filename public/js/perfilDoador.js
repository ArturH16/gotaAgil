const btnEditar = document.getElementById("btnEditar");
const btnSalvar = document.getElementById("btnSalvar");
const formPerfil = document.getElementById("formPerfil");
const inputs = formPerfil.querySelectorAll(".perfilInput");

btnEditar.addEventListener("click", () => {
    const estaEditando = formPerfil.classList.toggle("editando");

    btnSalvar.hidden = !estaEditando;
    btnEditar.textContent = estaEditando ? "Cancelar" : "Editar";

    inputs.forEach((input) => {
        if (!estaEditando) {
            // Restaura o valor original caso o usuário tenha cancelado a edição
            input.value = input.dataset.original;
        }
        input.disabled = !estaEditando;
    });

    if (estaEditando && inputs.length > 0) {
        inputs.focus();
    }
});
