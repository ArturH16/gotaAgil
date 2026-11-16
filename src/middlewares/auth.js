function exigeLogin(tipo) {
    return (req, res, next) => {
        if (!req.session.userID) return res.redirect(`/login/${tipo}`)
        if (req.session.userType !== tipo) return res.redirect("home")

        next()
    }
}

module.exports = { exigeLogin }