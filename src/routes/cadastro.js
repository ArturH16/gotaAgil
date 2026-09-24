const express = require("express")
const router = express.Router()

router.get("/",(req,res)=> {
    res.render("./cadastro", {
        layout: "auth",
        title: "Cadastro"
    })
})

module.exports = router