const formatarData = (iso) => (iso ? iso.split("-").reverse().join("/") : "—")

const hojeFortaleza = () =>
    new Date().toLocaleDateString("sv-SE", { timeZone: "America/Fortaleza" })   // AAAA-MM-DD

module.exports = { formatarData, hojeFortaleza }