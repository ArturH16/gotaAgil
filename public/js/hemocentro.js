const filtroStatus = document.getElementById("filtroStatus")
const cardsCampanha = document.querySelectorAll(".cardCampanhaHemocentro")

function filtrarCampanhas(statusSelecionado) {
    const status = statusSelecionado || "todas"

    cardsCampanha.forEach(card => {
        const cardCampanhaStatus = card.getAttribute("data-status")

        if (status === "todas" || status === cardCampanhaStatus) {
            card.style.display = "block"
        } else {
            card.style.display = "none"
        }
    })
}

filtroStatus.addEventListener("click", (event) => {
    // 2. Verifica se o que foi clicado é um dos botões de filtro
    const botaoClicado = event.target.closest(".filtroBtn")
    
    if (botaoClicado) {
        const valorFiltro = botaoClicado.getAttribute("data-status")
        
        filtrarCampanhas(valorFiltro)

        //  Remove a classe 'ativo' dos outros botões e coloca no atual
        document.querySelectorAll(".filtroBtn").forEach(btn => btn.classList.remove("ativo"))
        botaoClicado.classList.add("ativo")
    }
})

filtrarCampanhas()
