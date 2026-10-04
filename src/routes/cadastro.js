const express = require("express")
const router = express.Router()
const cadastroController = require("../controllers/cadastroController")

// router.get("/",(req,res)=> {
//     res.render("cadastro", {
//         layout: "auth",
//         title: "Cadastro"
//     })
// })

router.get("/",cadastroController.cadastrarGeral)

// router.get("/doador",(req,res)=> {
//     res.render("cadastro_doador", {
//         layout: "auth",
//         title: "Cadastro Doador"
//     })
// })

router.get("/doador",cadastroController.cadastrarDoador)

// router.get("/hemocentro",(req,res)=> {
//     res.render("cadastro_hemocentro", {
//         layout: "auth",
//         title: "Cadastro Hemocentro"
//     })
// })

router.get("/hemocentro",cadastroController.cadastrarHemocentro)

module.exports = router