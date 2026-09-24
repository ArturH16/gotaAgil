const express = require("express")
const router = express.Router()

router.get("/",(req,res)=> {
    res.render("cadastro", {
        layout: "auth",
        title: "Cadastro"
    })
})

router.get("/doador",(req,res)=> {
    res.render("cadastro_doador", {
        layout: "auth",
        title: "Cadastro Doador"
    })
})

router.get("/hemocentro",(req,res)=> {
    res.render("cadastro_hemocentro", {
        layout: "auth",
        title: "Cadastro Hemocentro"
    })
})

module.exports = router