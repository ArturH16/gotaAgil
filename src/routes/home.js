const express = require("express")
const router = express.Router()
const homeController = require("../controllers/homeController")

// router.get("/",(req,res)=> {
//     res.render("homepage", {
//         title: "Gota Ágil"
//     })
// })
router.get("/",homeController.renderizarHome)
module.exports = router