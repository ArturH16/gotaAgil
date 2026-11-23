const campanhaDAO = require("../models/campanhaDAO")

async function carregarCampanha(req, res, next) {
    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(404).send("Campanha não encontrada.")
    }

    try {
        const campanha = await campanhaDAO.buscarPorId(id, req.session.userID)

        // não existe OU é de outro hemocentro: mesma resposta, sem revelar qual
        if (!campanha) return res.status(404).send("Campanha não encontrada.")

        req.campanha = campanha
        next()
    } catch (err) {
        next(err)
    }
}

async function carregarCampanhaPublica(req, res, next) {
    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(404).send("Campanha não encontrada.")
    }
    try {
        const campanha = await campanhaDAO.buscarPublicaPorId(id, hojeFortaleza())
        if (!campanha) return res.status(404).send("Campanha não encontrada.")
        req.campanha = campanha
        next()
    } catch (err) {
        next(err)
    }
}

module.exports = { carregarCampanha,carregarCampanhaPublica }