const express = require("express")
const router = express.Router()

router.get("/",(req,res)=> {
    res.render("login", {
        layout: "auth",
        title: "Login",
        cssExtra: "landing"
    })
})

router.get("/doador",(req,res)=> {
    res.render("login_doador", {
        layout: "auth",
        title: "Login - Doador",
        cssExtra: "landing"
    })
})

router.get("/hemocentro",(req,res)=> {
    res.render("login_hemocentro", {
        layout: "auth",
        title: "Login - Hemocentro",
        cssExtra: "landing"
    })
})

module.exports = router