const hemocentroDAO = require("../models/hemocentroDAO")
const contatosDAO = require("../models/contatosDAO")
const campanhaDAO = require("../models/campanhaDAO")

async function logar(req,res) {
    const rotulos = {
        pendente: "Aguardando validação",
        recusado: "Cadastro recusado"
    }
    try {
        const hemocentro = await hemocentroDAO.buscarPorId(req.session.userID)
        if (!hemocentro) {
            return req.session.destroy(() => res.redirect("/login/hemocentro"))
        }
        req.session.statusHemocentro = hemocentro.status
        const bloqueadoBotoes = ["pendente","recusado"].includes(hemocentro.status)
         res.render("hemocentro_logado", {
            title: "Início",
            cssExtra: "homepageHemocentro",
            hemocentro,
            statusRotulo: rotulos[hemocentro.status] || hemocentro.status,
            bloqueadoBotoes
        })
    } catch(err) {
        console.log(err)
        res.status(500).send("Erro ao carregar a pagina.")
    }

}

async function listarDoadoresCampanha(req,res) {
    try {
        const contatos = await contatosDAO.buscarPorIdHemocentro(req.session.userID)
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
            ],
            contatos: contatos
        },
        title: "Lista de Interessados",
        loggedInHemocentro: true,
        cssExtra: "listaInteressados"
    }
    res.render("lista_doadores", dadosCampanha)
    }
    catch(err) {
        console.log(err)
        res.status(500).send("Erro ao carregar a página.")
    }
    
}

function exibirCriacaoCampanha(req,res) {
     res.render("criacao_campanhas",{
        title: "Criação Campanha",
        loggedInHemocentro: true,
        cssExtra: "campanhaNova"
    })
}

async function criarCampanha(req,res) {
    const idHemocentro = req.session.userID
    const {nome,descricao,tipoSanguineo,urgencia,dataFechamento,foto} = req.body
    const nomeNormalizado = (nome || "").trim()
    const descricaoNormalizada = (descricao || "").trim()

    const erros = []
    if (!nomeNormalizado) erros.push("Informe o nome.")
    if (!descricaoNormalizada) erros.push("Informe uma descrição.")
    
    if (erros.length) {
        return res.status(400).render("criacao_campanhas", {
            title: "Criação Campanha",
            loggedInHemocentro: true,
            cssExtra: "campanhaNova",
            dados: req.body
        })
    }
    try {
        const campanha = await campanhaDAO.insertCampanha({nome: nomeNormalizado,
            descricao: descricaoNormalizada,tipoSanguineo,urgencia,dataFechamento,foto,idHemocentro})
        console.log("Campanha criada com sucesso!")
        res.redirect("/hemocentro")

    } catch(err){
        console.log(err)
        res.status(500).send("Erro interno.")
    }
}

module.exports = {
    logar,
    listarDoadoresCampanha,
    exibirCriacaoCampanha,
    criarCampanha
}