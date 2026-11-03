const bcrypt = require("bcrypt")
const doadorDAO = require("../models/doadorDAO")

function logarGeral(req,res) {
    res.render("login", {
        layout: "auth",
        title: "Login"
    })
}

function exibirLoginDoador(req,res) {
     res.render("login_doador", {
        layout: "auth",
        title: "Login Doador"
    })

}

async function logarDoador(req,res) {
   const {nome,senha} = req.body
    const nomeNormalizado = (nome || "").trim()
    const erros = []
    if (!nomeNormalizado) erros.push("Informe o nome.")
    if (!senha) erros.push("Informe a senha.")

    if (erros.length) {
        req.body.senha = ""
        return res.status(400).render("login_doador", {
            layout: "auth",
            erros,
            dados: req.body,
            title: "Login Doador"
        })
    }
    try {
        const doador = await doadorDAO.buscarPorNome(nomeNormalizado)
        if (!doador) {
            return res.status(400).render("login_doador", {
                layout: "auth",
                erros: ["Email ou senha incorretos."],
                dados: req.body,
                title: "Login Doador"

            })
        }
        const senhaReal = await bcrypt.compare(senha,doador.senha_hash)
        
        if (!senhaReal) {
            return res.status(400).render("login_doador", {
                layout: "auth",
                erros: ["Email ou senha incorretos."],
                dados: req.body,
                title: "Login Doador"
            })
        }

        //Sessão no Supabase
        req.session.userID = doador.id_doador
        req.session.userName = doador.nome
        req.session.userType = "doador"
        return res.redirect("/usuario")
    }
    catch(err) {
        

        res.status(500).render("cadastro_doador", {
            layout: "auth",
            erros: ["Erro interno. Tente novamente."],
            dados: req.body,
            title: "Cadastro Doador"
        })
    }
}

function logarHemocentro(req,res) {
    res.render("login_hemocentro", {
        layout: "auth",
        title: "Login  Hemocentro"
    })
}

module.exports = {
    exibirLoginDoador,
    logarGeral,
    logarDoador,
    logarHemocentro
}