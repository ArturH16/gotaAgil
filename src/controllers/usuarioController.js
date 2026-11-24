const doadorDAO = require("../models/doadorDAO")
const campanhaDAO = require("../models/campanhaDAO")
const contatosDAO = require("../models/contatosDAO")
const ESTADOS = require("../utils/estados")
const { hojeFortaleza,formatarData } = require("../utils/data")
const {estaEncerrada,rotuloUrgencia} = require("../utils/campanhas")
const {urlFoto} = require("../utils/fotos")
const estados = require("../utils/estados")
const interesseDAO = require("../models/interesseDAO")
const  {redirecionarComAviso } = require("../utils/flash")

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
    const hoje = hojeFortaleza()
    try {
    const [doador, interesses] = await Promise.all([
    doadorDAO.buscarPorId(req.session.userID),
    interesseDAO.listarPorDoador(req.session.userID)
])
    if (!doador) {
        return req.session.destroy(() => res.redirect("/login/doador"))
    }
    const cards = interesses.map((c) => ({
        id: c.id_campanha,
        nome: c.nome,
        hemocentro: c.hemocentro,
        encerrada: estaEncerrada(c, hoje),
        urgenciaRotulo: rotuloUrgencia(c.urgencia),
        urgenciaClasse: (c.urgencia || "").toLowerCase(),
        dataFechamento: formatarData(c.data_fechamento),
        dataEncerramento: formatarData(c.encerrada_em || c.data_fechamento)
    }))
    const interessesOrdenados = [...cards.filter((c) => !c.encerrada), ...cards.filter((c) => c.encerrada)]
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
        estado: doador.estado,
    },
    interesses: interessesOrdenados
    }) 
} catch(err) {
    console.log(err)
    res.status(500).send("Erro ao carregar o perfil.")
}

}


function exibirAlterarSenha(req, res) {
    res.render("alterar_senha", { title: "Alterar senha", cssExtra: "campanhaNova" })
}

function renderErroSenha(res, status, erros) {
    return res.status(status).render("alterar_senha", {
        title: "Alterar senha",
        cssExtra: "campanhaNova",
        erros
    })
}

async function alterarSenha(req, res) {
    const { senhaAtual, novaSenha, confirmarSenha } = req.body

    // um campo repetido no corpo chega como array e quebraria o bcrypt
    if ([senhaAtual, novaSenha, confirmarSenha].some((v) => typeof v !== "string")) {
        return renderErroSenha(res, 400, ["Preencha todos os campos."])
    }

    const erros = []
    if (!senhaAtual) erros.push("Informe a senha atual.")
    if (novaSenha.length < 8) erros.push("A nova senha precisa de pelo menos 8 caracteres.")
    else if (Buffer.byteLength(novaSenha, "utf8") > 72) erros.push("A nova senha é longa demais.")
    if (novaSenha !== confirmarSenha) erros.push("A confirmação não confere com a nova senha.")
    if (senhaAtual && senhaAtual === novaSenha) erros.push("A nova senha deve ser diferente da atual.")
    if (erros.length) return renderErroSenha(res, 400, erros)

    try {
        const hashAtual = await doadorDAO.buscarHashPorId(req.session.userID)
        if (!hashAtual) return req.session.destroy(() => res.redirect("/login/doador"))

        const confere = await bcrypt.compare(senhaAtual, hashAtual)
        if (!confere) return renderErroSenha(res, 400, ["Senha atual incorreta."])

        const novoHash = await bcrypt.hash(novaSenha, 10)
        await doadorDAO.atualizarSenha(req.session.userID, novoHash)

        // troca o id da sessão depois de uma mudança de credencial
        const { userID, userName, userType } = req.session
        req.session.regenerate((err) => {
            if (err) {
                console.error(err)
                return res.status(500).send("Senha alterada, mas houve um erro na sessão. Entre novamente.")
            }
            req.session.userID = userID
            req.session.userName = userName
            req.session.userType = userType
            req.session.flash = { tipo: "sucesso", texto: "Senha alterada com sucesso!" }
            req.session.save((err) => {
                if (err) console.error(err)
                res.redirect("/usuario/perfil")
            })
        })
    } catch (err) {
        console.error(err)
        renderErroSenha(res, 500, ["Erro interno. Tente novamente."])
    }
}

async function mostrarCampanha(req,res) {
     try {
        const campanha = req.campanha
        const encerrada = estaEncerrada(campanha)
        const [contatos, interesse] = await Promise.all([
        contatosDAO.buscarPorIdHemocentro(campanha.id_hemocentro),
        interesseDAO.verificarInteresse(req.session.userID, campanha.id_campanha)
    ])

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
                dataEncerramento: formatarData(campanha.encerrada_em || campanha.data_fechamento),
                jaTemInteresse: Boolean(interesse)
            },
            hemocentro: {
                nome: campanha.hemocentro,
                endereco: `${campanha.logradouro}, ${campanha.numero} - ${campanha.bairro}`,
                cidadeEstado: `${campanha.cidade} - ${campanha.estado}`,
                cep: formatarCep(campanha.cep)
            },
            contatos: contatos.map(prepararContato),
            interesse: interesse
        })
    } catch (err) {
        console.error(err)
        res.status(500).send("Erro ao carregar a página.")
    }
}

async function registrarInteresse(req, res) {
    const campanha = req.campanha
    const destino = `/usuario/detalhesCampanha/${campanha.id_campanha}`

    if (estaEncerrada(campanha)) {
        return redirecionarComAviso(req, res, "erro", "Esta campanha já está encerrada.", destino)
    }

    try {
        const criado = await interesseDAO.insertInteresse(req.session.userID, campanha.id_campanha, hojeFortaleza())

        if (!criado) {
            return redirecionarComAviso(req, res, "erro", "Você já demonstrou interesse nesta campanha.", destino)
        }
        redirecionarComAviso(req, res, "sucesso", "Interesse registrado!", destino)
    } catch (err) {
        console.error(err)
        redirecionarComAviso(req, res, "erro", "Erro interno. Tente novamente.", destino)
    }
}

async function cancelarInteresse(req, res) {
    const campanha = req.campanha
    const destino = `/usuario/detalhesCampanha/${campanha.id_campanha}`

    if (estaEncerrada(campanha)) {
        return redirecionarComAviso(req, res, "erro", "Campanha encerrada: o interesse não pode mais ser cancelado.", destino)
    }

    try {
        const removido = await interesseDAO.cancelarInteresse(req.session.userID, campanha.id_campanha)

        if (!removido) {
            return redirecionarComAviso(req, res, "erro", "Não foi possível cancelar o interesse.", destino)
        }
        redirecionarComAviso(req, res, "sucesso", "Interesse cancelado.", destino)
    } catch (err) {
        console.error(err)
        redirecionarComAviso(req, res, "erro", "Erro interno. Tente novamente.", destino)
    }
}

module.exports = {
    logar,
    mostrarPerfil,
    mostrarCampanha,
    exibirAlterarSenha,
    alterarSenha,
    registrarInteresse,
    cancelarInteresse
}