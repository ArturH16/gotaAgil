function redirecionarComAviso(req, res, tipo, texto, destino) {
    req.session.flash = { tipo, texto }
    req.session.save((err) => {
        if (err) console.error(err)
        res.redirect(destino)
    })
}

module.exports = { redirecionarComAviso }