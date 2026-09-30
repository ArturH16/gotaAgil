const express = require("express")
const router = express.Router()

router.get("/",(req,res)=> {
    const hemocentroMockado = {
        title: "Início",
        loggedInHemocentro: true,
        hemocentro: {
            nome: "Hemocentro Regional Fortaleza",
            aprovado: false
        }
    }
    res.render("hemocentro_logado",hemocentroMockado)
})

module.exports = router