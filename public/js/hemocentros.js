const filtroEstado = document.getElementById("estadoSelect")
const cardsEstado = document.querySelectorAll(".cardHemocentro")

filtroEstado.addEventListener("change", function() {
    const estadoSelecionado = this.value
    cardsEstado.forEach(estado => {
        const cardEstado = estado.getAttribute("data-estado")

        if (estadoSelecionado === "todos" || estadoSelecionado === cardEstado) {
            estado.style.display = "block"
        } else {
            estado.style.display = "none"
        }
    })
})