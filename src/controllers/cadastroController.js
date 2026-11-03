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
    const hoje = new Date()
    const limite = new Date(hoje.getFullYear() - 16, hoje.getMonth(), hoje.getDate())
    console.log(limite)
    console.log(req.body.dataNascimento)
    const { nome, email, senha, tipoSanguineo, cpf, peso, cidade, estado, dataNascimento} = req.body
    const nomeNormalizado = (nome || "").trim()
    const emailNormalizado = (email || "").trim().toLowerCase()
    const cpfNormalizado = (cpf || "").replace(/\D/g,"")
    

    const erros = []
    if (!nomeNormalizado) erros.push("Informe o nome.")
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)) erros.push("E-mail inválido.");
    if (!validadorCPF.isValid(cpfNormalizado)) erros.push("CPF inválido.")
    if (!req.body.senha || req.body.senha.length < 8) erros.push("A senha precisa de pelo menos 8 caracteres.")
    if (new Date(dataNascimento) > limite) erros.push(" Data de nascimento inválida: é preciso ter pelo menos 16 anos.")
    if (peso < 50) erros.push("Peso incompatível. Por favor, verificar peso mínimo na home.") 

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
        await doadorDAO.insertDoador({
            nome: nomeNormalizado,
            email: emailNormalizado,
            senhaHash,
            tipoSanguineo,
            cpf: cpfNormalizado,
            peso,
            cidade,
            estado,
            dataNascimento
        })
        console.log("Dados enviados com sucesso!")
        res.redirect("/login/doador")
    }
    catch (err) {
        console.log(err)

        if (err.code === "23505") {
            const campo = err.constraint?.includes("cpf") ? "CPF" : "E-mail"
            req.body.senha = ""
            return res.status(400).render("cadastro_doador", {
                layout: "auth",
                erros: [`${campo} já cadastrado.`],
                dados: req.body,
                title: "Cadastro Doador"
            })
        }

        res.status(500).render("cadastro_doador", {
            layout: "auth",
            erros: ["Erro interno. Tente novamente."],
            dados: req.body,
            title: "Cadastro Doador"
        })
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