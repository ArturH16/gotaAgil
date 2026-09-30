const inputFoto = document.getElementById("foto");
const previewFoto = document.getElementById("previewFoto");

inputFoto.addEventListener("change", () => {
    const arquivo = inputFoto.files[0];
    if (arquivo) {
        previewFoto.src = URL.createObjectURL(arquivo);
        previewFoto.hidden = false;
    } else {
        previewFoto.hidden = true;
    }
});