const doadorDAO = require("../models/doadorDAO")
const campanhaDAO = require("../models/campanhaDAO")
const ESTADOS = require("../utils/estados")
const { hojeFortaleza,formatarData } = require("../utils/data")
const {rotuloUrgencia} = require("../utils/campanhas")
const {urlFoto} = require("../utils/fotos")
const TIPOS_SANGUINEOS =  ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
const SIGLAS = ESTADOS.map((e) => e.sigla)
function lerFiltro(valor,permitidos) {
    const v = Array.isArray(valor) ? valor[0]: valor
    return permitidos.includes(v) ? v : null
}

async function logar(req,res) {
    try{
        const doador = await doadorDAO.buscarPorId(req.session.userID)
        if (!doador) {
            return req.session.destroy(() => res.redirect("/login/doador"))
        }
        // primeira visita (sem parâmetros): padrão é o estado do doador
        // depois que o formulário de filtros é enviado, vale o que veio na URL
        const enviouFiltros = "tipo" in req.query || "estado" in req.query
        const tipo = enviouFiltros ? lerFiltro(req.query.tipo, TIPOS_SANGUINEOS) : doador.tipo_sanguineo
        const estado = enviouFiltros ? lerFiltro(req.query.estado, SIGLAS) : doador.estado
        const campanhas = await campanhaDAO.listarAbertas(
            {hoje: hojeFortaleza(),
            tipo: doador.tipo_sanguineo,
            estado: doador.estado
        })
        const cards = campanhas.map((c) => ({
                id: c.id_campanha,
                nome: c.nome,
                tipoSanguineo: c.tipo_sanguineo_necessario,
                urgenciaRotulo: rotuloUrgencia(c.urgencia),
                urgenciaClasse: (c.urgencia || "").toLowerCase(),
                dataFechamento: formatarData(c.data_fechamento),
                hemocentro: c.hemocentro,
                local: `${c.cidade} - ${c.estado}`,
                fotoUrl: urlFoto(c.foto)
            }))

            res.render("doador_logado", {
                title: "Início",
                cssExtra: "homepageDoador",
                campanhas: cards,
                filtros: { tipo, estado },
                temFiltro: Boolean(tipo || estado),
                tiposSanguineos: TIPOS_SANGUINEOS,
                estados: ESTADOS
            })
    } catch (err) {
        console.error(err)
        res.status(500).send("Erro ao carregar a página.")
    }
}

async function mostrarPerfil(req,res) {
    try {
    const doador = await doadorDAO.buscarPorId(req.session.userID)
    if (!doador) {
        return req.session.destroy(() => res.redirect("/login/doador"))
    }
    res.render("perfil_doador", {
    title: "Meu Perfil",
    cssExtra: "perfil",
    doador: {
        nome: doador.nome,
        iniciais: doador.nome.split(" ").filter(Boolean).slice(0, 2).map(p => p[0]).join("").toUpperCase(),
        email: doador.email,
        tipoSanguineo: doador.tipo_sanguineo,
        cpfMascarado: `***.***.${doador.cpf.slice(6, 9)}-${doador.cpf.slice(9)}`,
        dataNascimento: doador.data_nascimento.toLocaleDateString("pt-BR"),
        peso: doador.peso,
        cidade: doador.cidade,
        estado: doador.estado
    } 
    }) 
} catch(err) {
    console.log(err)
    res.status(500).send("Erro ao carregar o perfil.")
}

}

function mostrarCampanha(req,res) {
    const dadosCampanha = {campanha: {
    id: 1,
    imagem: "/images/WhatsApp-Image-2022-11-04-at-07.43.34-600x619.jpeg",
    titulo: "Campanha Emergencial de Verão",
    urgencia: "Urgente",
    tipoSanguineo: "O-",
    descricao: "Estoque crítico de O negativo. Traga documento com foto.",
    hemocentro: "Hemocentro Regional Fortaleza",
    endereco: "Av. Exemplo, 1000 - Centro, Fortaleza - CE",
    contatos: ["(85) 3101-2305", "(85) 99681-7597"],
    dataFechamento: "12/10/2026",
    encerrada: false
},
jaDemonstrouInteresse: true,
title: "Campanha",
cssExtra: "campanhaDetalhe" }
    res.render("detalhes_campanha",dadosCampanha )
}
module.exports = {
    logar,
    mostrarPerfil,
    mostrarCampanha
}