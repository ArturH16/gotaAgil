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
        // 3. Pega o valor do atributo 'data-status' do botão clicado
        const valorFiltro = botaoClicado.getAttribute("data-status")
        
        // 4. Executa a função de filtrar com o status correto
        filtrarCampanhas(valorFiltro)

        //  Remove a classe 'ativo' dos outros botões e coloca no atual
        document.querySelectorAll(".filtroBtn").forEach(btn => btn.classList.remove("ativo"))
        botaoClicado.classList.add("ativo")
    }
})

filtrarCampanhas()
