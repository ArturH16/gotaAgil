const doadorDAO = require("../models/doadorDAO")
const campanhaDAO = require("../models/campanhaDAO")
const contatosDAO = require("../models/contatosDAO")
const ESTADOS = require("../utils/estados")
const { hojeFortaleza,formatarData } = require("../utils/data")
const {estaEncerrada,rotuloUrgencia} = require("../utils/campanhas")
const {urlFoto} = require("../utils/fotos")
const estados = require("../utils/estados")

const TIPOS_SANGUINEOS =  ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
const SIGLAS = ESTADOS.map((e) => e.sigla)
const formatarCep =   (cep) => (cep || "").replace(/^(\d{5})(\d{3})$/, "$1-$2")

function lerFiltro(valor,permitidos) {
    const v = Array.isArray(valor) ? valor[0]: valor
    return permitidos.includes(v) ? v : null
}

function prepararContato(c) {
    const valor = String(c.contato || "").trim()
    const digitos = valor.replace(/\D/g, "")
    const rotulos = { whatsapp: "WhatsApp", telefone: "Telefone", "0800": "0800", email: "E-mail", instagram: "Instagram" }
    let href = null

    switch (c.tipo_contato) {
        case "whatsapp":  href = digitos ? `https://wa.me/55${digitos}` : null; break   // assume DDD sem o 55
        case "telefone":
        case "0800":      href = digitos ? `tel:${digitos}` : null; break
        case "email":     href = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor) ? `mailto:${valor}` : null; break
        case "instagram": {
            const usuario = valor.replace(/^@/, "")
            href = /^[A-Za-z0-9._]{1,30}$/.test(usuario) ? `https://instagram.com/${usuario}` : null
            break
        }
    }
    return { rotulo: rotulos[c.tipo_contato] || "Contato", valor, href }
}

async function logar(req, res) {
    try {
        const doador = await doadorDAO.buscarPorId(req.session.userID)
        if (!doador) {
            return req.session.destroy(() => res.redirect("/login/doador"))
        }

        const campanhas = await campanhaDAO.listarAbertas({
            hoje: hojeFortaleza(),
            estado: doador.estado,
            tipoSanguineo: doador.tipo_sanguineo
        })

        const cards = campanhas.map((c) => ({
            id: c.id_campanha,
            nome: c.nome,
            id_hemocentro: c.id_hemocentro,
            tipoSanguineo: c.tipo_sanguineo_necessario,
            seuTipo: c.tipo_sanguineo_necessario === doador.tipo_sanguineo,
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
            estadoDoador: doador.estado
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

async function mostrarCampanha(req,res) {
     try {
        const campanha = req.campanha
        const contatos = await contatosDAO.buscarPorIdHemocentro(campanha.id_hemocentro)
        const encerrada = estaEncerrada(campanha)

        res.render("detalhes_campanha", {          
            title: campanha.nome,
            cssExtra: "campanhaDetalhe",
            campanha: {
                id: campanha.id_campanha,
                imagem: urlFoto(campanha.foto),
                titulo: campanha.nome,
                descricao: campanha.descricao,
                tipoSanguineo: campanha.tipo_sanguineo_necessario,
                urgenciaRotulo: rotuloUrgencia(campanha.urgencia),
                urgenciaClasse: (campanha.urgencia || "").toLowerCase(),
                dataInicio: formatarData(campanha.data_inicio),
                dataFechamento: formatarData(campanha.data_fechamento),
                encerrada,
                dataEncerramento: formatarData(campanha.encerrada_em || campanha.data_fechamento)
            },
            hemocentro: {
                nome: campanha.hemocentro,
                endereco: `${campanha.logradouro}, ${campanha.numero} - ${campanha.bairro}`,
                cidadeEstado: `${campanha.cidade} - ${campanha.estado}`,
                cep: formatarCep(campanha.cep)
            },
            contatos: contatos.map(prepararContato)
        })
    } catch (err) {
        console.error(err)
        res.status(500).send("Erro ao carregar a página.")
    }
}

module.exports = {
    logar,
    mostrarPerfil,
    mostrarCampanha
}