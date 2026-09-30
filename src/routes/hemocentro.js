const express = require("express")
const router = express.Router()

router.get("/",(req,res)=> {
    const hemocentroMockado = {
        title: "Início",
        loggedInHemocentro: true,
        hemocentro: {
            nome: "Hemocentro Regional Fortaleza",
            aprovado: false
        }
    }
    res.render("hemocentro_logado",hemocentroMockado)
})

router.get("/listaCampanha", (req, res) => {
    const dadosCampanha = {
        campanha: {
            imagem: "/images/WhatsApp-Image-2022-11-04-at-07.43.34-600x619.jpeg",
            titulo: "Campanha Emergencial de Verão",
            urgencia: "Urgente",
            tipoSanguineo: "O-",
            interessados: [
                { nome: "Artur Holanda", email: "holandaartur163@gmail.com" },
                { nome: "Axl Rose", email: "roseaxl@gmail.com" },
                { nome: "Pedro Assaad", email: "assaadpedro@gmail.com" },
                { nome: "Daniel Assaad", email: "assaad.daniel@gmail.com" },
                { nome: "Pedro Hélios", email: "heliospedro2701@gmail.com" },
                { nome: "Pedro Paulo", email: "paulopedro@gmail.com" },
                { nome: "Sylvester Stallone", email: "stallone@gmail.com" },
                { nome: "José Roberto", email: "jbr@gmail.com" },
                { nome: "César Olavo", email: "olavocesar@gmail.com" },
                { nome: "Sávio Sobreira Alves", email: "savio.alves06@aluno.ifce.edu.br" }
            ]
        },
        title: "Lista de Interessados",
        loggedInHemocentro: true
    }
    res.render("lista_doadores", dadosCampanha)
})

router.get("/campanha/nova",(req,res)=> {
    res.render("criacao_campanhas",{
        title: "Criação Campanha",
        loggedInHemocentro: true
    })
})
module.exports = router