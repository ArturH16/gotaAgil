const express = require("express")
const router = express.Router()

router.get("/",(req,res)=> {
    res.render("login", {
        layout: "auth",
        title: "Login"
    })
})

module.exports = router