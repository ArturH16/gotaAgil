const bcrypt = require("bcrypt")
const doadorDAO = require("../models/doadorDAO")
const hemocentroDAO = require("../models/hemocentroDAO")
const { cpf: validadorCPF, cnpj: validadorCNPJ} = require("cpf-cnpj-validator")

const renderErroHemocentro = (req,res,status, erros,contatos) =>
    res.status(status).render("cadastro_hemocentro", {
        layout: "auth",
        title: "Cadastro Hemocentro",
        erros,
        dados: { ...req.body, senha: "", contatos }
    })

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

function exibirCadastroHemocentro(req,res) {
    res.render("cadastro_hemocentro", {
        layout: "auth",
        title: "Cadastro Hemocentro"
    })
}

async function cadastrarHemocentro(req,res) {
    const {nome,email,senha,codigoCnes,cnpj,estado,cidade,bairro,logradouro,numero,cep,contatoTipo,contatoValor} = req.body
    
    const tipos = [].concat(contatoTipo || [])
    const valores = [].concat(contatoValor || [])
    const contatos = tipos.map((tipo,i) => ( {
        tipo,
        valor: (valores[i] || "").trim()
    }))
    const nomeNormalizado = (nome || "").trim()
    const emailNormalizado = (email || "").trim().toLowerCase()
    const codigoCnesNormalizado = (codigoCnes || "").replace(/\D/g, "")
    const cnpjNormalizado = (cnpj || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    const numeroNormalizado = (numero || "").trim()
    const cepNormalizado = (cep || "").replace(/\D/g,"")

    const erros = []
    if (!nomeNormalizado) erros.push("Informe o nome.")
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)) erros.push("E-mail inválido.");
    if (!/^\d{7}$/.test(codigoCnesNormalizado)) erros.push("Código CNES inválido.")
    if (!req.body.senha || req.body.senha.length < 8) erros.push("A senha precisa de pelo menos 8 caracteres.")
    if (!validadorCNPJ.isValid(cnpjNormalizado)) erros.push("CNPJ inválido")
    if(!numeroNormalizado) erros.push("Informe o número do endereço do hemocentro.")
    if (!cepNormalizado || cepNormalizado.length !=8) erros.push("CEP inválido")
    
    if (erros.length) {
        return renderErroHemocentro(req,res,400,erros,contatos)
    }
    try {
        const senhaHash = await bcrypt.hash(senha,10)
        await hemocentroDAO.insertHemocentro({
            nome: nomeNormalizado,
            email: emailNormalizado,
            senhaHash,
            codigoCnes: codigoCnesNormalizado,
            cnpj: cnpjNormalizado,
            cep: cepNormalizado,
            cidade,
            estado,
            bairro,
            logradouro,
            numero: numeroNormalizado,
            contatos
        })
        console.log("Dados enviados com sucesso!")
        res.redirect("/login/hemocentro")
    } catch (err) {
        console.log(err)

        if (err.code === "23505") {
            const coluna = (err.detail || "").match(/\((\w+)\)=/)?.[1]
            const rotulos = { cnpj: "CNPJ", codigo_cnes: "Código CNES", email: "E-mail" }
            const msg = rotulos[coluna]
                ? `${rotulos[coluna]} já cadastrado.`
                : "Já existe um cadastro com esses dados."

            return renderErroHemocentro(req, res, 400, [msg], contatos)
        }
        return renderErroHemocentro(req, res, 500, ["Erro interno. Tente novamente."], contatos)

}
}

module.exports = {
    cadastrarGeral,
    exibirCadastroDoador,
    cadastrarDoador,
    exibirCadastroHemocentro,
    cadastrarHemocentro
}