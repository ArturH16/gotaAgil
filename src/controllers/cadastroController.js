const bcrypt = require("bcrypt")
const doadorDAO = require("../models/doadorDAO")

function cadastrarGeral(req,res) {
    res.render("cadastro", {
        layout: "auth",
        title: "Cadastro"
    })
}

function exibirCadastroDoador(req,res) {
     
    res.render("cadastro_doador", {
        layout: "auth",
        title: "Cadastro Hemocentro"
    })
}

async function cadastrarDoador(req,res) {
    const { nome, email, senha, tipoSanguineo, cpf, peso, cidade, estado, dataNascimento} = req.body

    try {
        const senhaHash = await bcrypt.hash(senha,10)
        await doadorDAO.insertDoador({nome,email,senhaHash,tipoSanguineo,cpf,peso,cidade,estado,dataNascimento})
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