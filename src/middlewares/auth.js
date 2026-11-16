function exigeLogin(tipo) {
    return (req, res, next) => {
        if (!req.session.userID) return res.redirect(`/login/${tipo}`)
        if (req.session.userType !== tipo) return res.status(403).send("Acesso negado.")

        next()
    }
}

module.exports = { exigeLogin }