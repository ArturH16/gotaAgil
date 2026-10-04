const express = require("express")
const router = express.Router()
const login = require("../controllers/loginController")

// router.get("/",(req,res)=> {
//     res.render("login", {
//         layout: "auth",
//         title: "Login"
//     })
// })

router.get("/",login.logarGeral)

// router.get("/doador",(req,res)=> {
//     res.render("login_doador", {
//         layout: "auth",
//         title: "Login - Doador"
//     })
// })

router.get("/doador",login.logarDoador)
// router.get("/hemocentro",(req,res)=> {
//     res.render("login_hemocentro", {
//         layout: "auth",
//         title: "Login - Hemocentro"
//     })
// })

router.get("/hemocentro",login.logarHemocentro)

module.exports = router