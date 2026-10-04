function logarGeral(req,res) {
    res.render("login", {
        layout: "auth",
        title: "Login"
    })
}

function logarDoador(req,res) {
    res.render("login_doador", {
        layout: "auth",
        title: "Login - Doador"
    })
}

function logarHemocentro(req,res) {
    res.render("login_hemocentro", {
        layout: "auth",
        title: "Login - Hemocentro"
    })
}

module.exports = {
    logarGeral,
    logarDoador,
    logarHemocentro
}