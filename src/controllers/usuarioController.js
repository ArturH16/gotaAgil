const doadorDAO = require("../models/doadorDAO")

function logar(req,res) {
    res.render("doador_logado", {
        title: "Início",
        cssExtra: "homepageDoador"
    })
}

async function mostrarPerfil(req,res) {
    try {
    const doador = await doadorDAO.buscarPorId(req.session.userID)
    if (!doador) {
        return req.session.destroy(() => res.redirect("/login/doador"))
    }
    res.render("perfil_doador", {
    title: "Meu Perfil",
    cssExtra: "perfil",
    doador: {
        nome: doador.nome,
        iniciais: doador.nome.split(" ").filter(Boolean).slice(0, 2).map(p => p[0]).join("").toUpperCase(),
        email: doador.email,
        tipoSanguineo: doador.tipo_sanguineo,
        cpfMascarado: `***.***.${doador.cpf.slice(6, 9)}-${doador.cpf.slice(9)}`,
        dataNascimento: doador.data_nascimento.toLocaleDateString("pt-BR"),
        peso: doador.peso,
        cidade: doador.cidade,
        estado: doador.estado
    } 
    }) 
} catch(err) {
    console.log(err)
    res.status(500).send("Erro ao carregar o perfil.")
}

}

function mostrarCampanha(req,res) {
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
jaDemonstrouInteresse: true,
title: "Campanha",
cssExtra: "campanhaDetalhe" }
    res.render("detalhes_campanha",dadosCampanha )
}
module.exports = {
    logar,
    mostrarPerfil,
    mostrarCampanha
}