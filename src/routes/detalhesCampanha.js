const express = require("express")
const router = express.Router()

router.get("/",(req,res)=> {
    const dadosCampanha = {campanha: {
    id: 1,
    imagem: "/images/WhatsApp-Image-2022-11-04-at-07.43.34-600x619.jpeg",
    titulo: "Campanha Emergencial de Verão",
    urgencia: "Urgente",
    tipoSanguineo: "O-",
    descricao: "Estoque crítico de O negativo. Traga documento com foto.",
    hemocentro: "Hemocentro Regional Fortaleza",
    endereco: "Av. Exemplo, 1000 - Centro, Fortaleza - CE",
    contatos: ["(85) 3101-2305", "(85) 99681-7597"],
    dataFechamento: "12/10/2026",
    encerrada: false
},
jaDemonstrouInteresse: true }
    res.render("detalhes_campanha",dadosCampanha )
})


module.exports = router