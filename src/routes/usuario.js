const express = require("express")
const router = express.Router()

router.get("/",(req,res)=> {
    res.render("doador_logado", {
        title: "Início",
        loggedIn: true,
        nomeDoador: "Artur"
    })
})

router.get("/perfil",(req,res)=> {
    const usuarioMockado =
    {
    loggedIn: true,
    title: "Meu Perfil",
    doador: {
    nome: "Artur Silva",
    iniciais: "AS",
    email: "artur@email.com",
    tipoSanguineo: "O-",
    cpfMascarado: "***.***.789-00",
    dataNascimento: "15/03/2000",
    peso: 72,
    cidade: "Fortaleza",
    estado: "CE"
}}
    res.render("perfil_doador",usuarioMockado)

})
module.exports = router