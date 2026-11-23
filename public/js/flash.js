document.addEventListener("DOMContentLoaded", () => {
    function fechar(aviso) {
        if (aviso.dataset.fechando) return
        aviso.dataset.fechando = "1"
        aviso.classList.add("some")
        setTimeout(() => aviso.remove(), 600)
    }

    document.querySelectorAll(".flash").forEach((aviso) => {
        const tempo = Number(aviso.dataset.autoFechar) || 2000
        setTimeout(() => fechar(aviso), tempo)

        const botao = aviso.querySelector(".flash-fechar")
        if (botao) botao.addEventListener("click", () => fechar(aviso))
    })
})