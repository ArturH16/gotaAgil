const filtroEstado = document.getElementById("estadoSelect")
const cardsEstado = document.querySelectorAll(".cardHemocentro")
function filtrarEstado() {
    const estadoSelecionado = filtroEstado.value
    cardsEstado.forEach(estado => {
        const cardEstado = estado.getAttribute("data-estado")

        if (estadoSelecionado === "todos" || estadoSelecionado === cardEstado) {
            estado.style.display = "block"
        } else {
            estado.style.display = "none"
        }
    })
}

filtroEstado.addEventListener("change",filtrarEstado)

filtrarEstado()