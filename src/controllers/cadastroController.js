const bcrypt = require("bcrypt")
const doadorDAO = require("../models/doadorDAO")
const { cpf: validadorCPF} = require("cpf-cnpj-validator")

function cadastrarGeral(req,res) {
    res.render("cadastro", {
        layout: "auth",
        title: "Cadastro"
    })
}

function exibirCadastroDoador(req,res) {
     
    res.render("cadastro_doador", {
        layout: "auth",
        title: "Cadastro Doador"
    })
}

async function cadastrarDoador(req,res) {
    const { nome, email, senha, tipoSanguineo, cpf, peso, cidade, estado, dataNascimento} = req.body
    const nomeNormalizado = (nome || "").trim()
    const emailNormalizado = (email || "").trim().toLowerCase()
    const cpfNormalizado = (cpf || "").replace(/\D/g,"")

    const erros = []
    if (!nomeNormalizado) erros.push("Informe o nome.")
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)) erros.push("E-mail inválido.");
    if (!validadorCPF.isValid(cpfNormalizado)) erros.push("CPF inválido.")
    if (!req.body.senha || req.body.senha.length < 8) erros.push("A senha precisa de pelo menos 8 caracteres.")

    if (erros.length) {
        req.body.senha = ""
        return res.status(400).render("cadastro_doador", {
            layout: "auth",
            erros,
            dados: req.body,
            title: "Cadastro Doador"
        })
    }

    try {
        const senhaHash = await bcrypt.hash(senha,10)
        await doadorDAO.insertDoador({nomeNormalizado,emailNormalizado,senhaHash,tipoSanguineo,cpfNormalizado,peso,cidade,estado,dataNascimento})
        console.log("Dados enviados com sucesso!")
        res.redirect("/login/doador")
    }
    catch (err) {
        console.log(err)
        res.status(500).send("Erro ao cadastrar");
    }
}

function cadastrarHemocentro(req,res) {
    res.render("cadastro_hemocentro", {
        layout: "auth",
        title: "Cadastro Hemocentro"
    })
}

module.exports = {
    cadastrarGeral,
    exibirCadastroDoador,
    cadastrarDoador,
    cadastrarHemocentro
}