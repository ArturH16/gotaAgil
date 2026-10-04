function cadastrarGeral(req,res) {
    res.render("cadastro", {
        layout: "auth",
        title: "Cadastro"
    })
}

function cadastrarDoador(req,res) {
     res.render("cadastro_doador", {
        layout: "auth",
        title: "Cadastro Doador"
    })
}

function cadastrarHemocentro(req,res) {
    res.render("cadastro_hemocentro", {
        layout: "auth",
        title: "Cadastro Hemocentro"
    })
}

module.exports = {
    cadastrarGeral,
    cadastrarDoador,
    cadastrarHemocentro
}