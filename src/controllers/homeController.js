function renderizarHome(req,res) {
    res.render("homepage", {
        title: "Gota Ágil"
    })
}

module.exports = {
    renderizarHome
}