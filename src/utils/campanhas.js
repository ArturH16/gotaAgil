const hojeFortaleza = new Date().toLocaleDateString("sv-SE", { timeZone: "America/Fortaleza" })

const ROTULOS_URGENCIA = { urgente: "Urgente", moderada: "Moderada", regular: "Regular" }

const rotuloUrgencia = (valor) =>
    ROTULOS_URGENCIA[(valor || "").toLowerCase()] || valor || ""

module.exports = { estaEncerrada, rotuloUrgencia }

function estaEncerrada(campanha, hoje = hojeFortaleza) {
    return Boolean(campanha.encerrada_em) || campanha.data_fechamento < hoje
}

module.exports = { estaEncerrada,rotuloUrgencia }