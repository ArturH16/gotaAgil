const express = require("express")
const router = express.Router()

router.get("/",(req,res)=> {
    res.render("hemocentro_logado", {
        loggedInHemocentro: true,
        title: "Início"
    })
})

module.exports = router