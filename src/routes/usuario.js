const express = require("express")
const router = express.Router()

router.get("/",(req,res)=> {
    res.render("usuario_logado", {
        title: "Início",
        loggedIn: true,
        nomeDoador: "Artur"
    })
})

module.exports = router