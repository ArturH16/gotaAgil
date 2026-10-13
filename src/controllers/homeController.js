function renderizarHome(req,res) {
    res.render("homepage", {
        title: "Gota Ágil",
        cssExtra: "landing"
    })
}

module.exports = {
    renderizarHome
}