const bcrypt = require("bcrypt")
const doadorDAO = require("../models/doadorDAO")
const hemocentroDAO = require("../models/hemocentroDAO")

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
   const {email,senha} = req.body
    const emailNormalizado = (email || "").trim().toLowerCase()
    const erros = []
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)) erros.push("E-mail inválido.");
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
        const doador = await doadorDAO.buscarPorEmail(emailNormalizado)
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

function exibirLoginHemocentro(req,res) {
    res.render("login_hemocentro", {
        layout: "auth",
        title: "Login  Hemocentro"
    })
}
function logout(req, res) {
    const tipo = req.session.userType
    req.session.destroy((err) => {
        if (err) console.error(err)
        res.clearCookie("connect.sid")
        res.redirect(tipo ? `/login/${tipo}` : "/")
    })
}

async function logarHemocentro(req,res) {
    const {email,senha} = req.body
    const emailNormalizado = (email || "").trim().toLowerCase()
    const erros = []
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)) erros.push("E-mail inválido.");
    if (!senha) erros.push("Informe a senha.")

    if (erros.length) {
        req.body.senha = ""
        return res.status(400).render("login_hemocentro", {
            layout: "auth",
            erros,
            dados: req.body,
            title: "Login Hemocentro"
        })
    }
    try {
        const hemocentro = await hemocentroDAO.buscarPorEmail(emailNormalizado)
         if (!hemocentro) {
            return res.status(400).render("login_hemocentro", {
                layout: "auth",
                erros: ["Email ou senha incorretos."],
                dados: req.body,
                title: "Login Hemocentro"

            })
        }
        const senhaReal = await bcrypt.compare(senha,hemocentro.senha_hash)
        
        if (!senhaReal) {
            return res.status(400).render("login_hemocentro", {
                layout: "auth",
                erros: ["Email ou senha incorretos."],
                dados: req.body,
                title: "Login Hemocentro"
            })
        }

        //Sessão no Supabase
        req.session.userID = hemocentro.id_hemocentro
        req.session.userName = hemocentro.nome
        req.session.userType = "hemocentro"
        return res.redirect("/hemocentro")
    }
    catch(err) {
        console.log(err)
        res.status(500).render("cadastro_hemocentro", {
            layout: "auth",
            erros: ["Erro interno. Tente novamente."],
            dados: req.body,
            title: "Cadastro Hemocentro"
        })
    }
    }



module.exports = {
    exibirLoginDoador,
    logarGeral,
    logarDoador,
    exibirLoginHemocentro,
    logarHemocentro,
    logout
}