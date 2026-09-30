const btnEditar = document.getElementById("btnEditar");
const btnSalvar = document.getElementById("btnSalvar");
const formPerfil = document.getElementById("formPerfil");
const inputs = formPerfil.querySelectorAll(".perfilInput");

btnEditar.addEventListener("click", () => {
    formPerfil.classList.toggle("editando");
    btnSalvar.hidden = !formPerfil.classList.contains("editando");
    inputs.forEach(input => input.disabled = !formPerfil.classList.contains("editando"));
    btnEditar.textContent = formPerfil.classList.contains("editando") ? "Cancelar" : "Editar";
});