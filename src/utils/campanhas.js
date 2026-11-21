const hojeFortaleza = new Date().toLocaleDateString("sv-SE", { timeZone: "America/Fortaleza" })  

function estaEncerrada(campanha, hoje = hojeFortaleza) {
    return Boolean(campanha.encerrada_em) || campanha.data_fechamento < hoje
}

module.exports = { estaEncerrada }