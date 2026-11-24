const hemocentroDAO = require("../models/hemocentroDAO")
const contatosDAO = require("../models/contatosDAO")
const campanhaDAO = require("../models/campanhaDAO")
const crypto = require("crypto")
const sharp = require("sharp")
const supabase = require("../supabase")
const { urlFoto } = require("../utils/fotos")
const { estaEncerrada, rotuloUrgencia } = require("../utils/campanhas")
const hoje = require("../utils/data")
const {redirecionarComAviso} = require("../utils/flash")

function configFormCampanha(campanha) {
    if (!campanha) {
        return {
            tituloForm: "Nova campanha",
            action: "/hemocentro/campanha/nova",
            textoBotao: "Criar campanha",
            voltarHref: "/hemocentro"
        }
    }
    return {
        tituloForm: "Editar campanha",
        action: `/hemocentro/campanha/${campanha.id_campanha}/editar`,
        textoBotao: "Salvar alterações",
        voltarHref: `/hemocentro/listaCampanha/${campanha.id_campanha}`
    }
}

async function salvarFoto(buffer) {
    let imagem
    try {
        imagem = await sharp(buffer)
            .rotate()
            .resize({ width: 1200, withoutEnlargement: true })
            .webp({ quality: 80 })
            .toBuffer()
    } catch {
        throw new Error("IMAGEM_INVALIDA")
    }

    const nome = `${crypto.randomUUID()}.webp`
    const { error } = await supabase.storage
        .from("campanhas")
        .upload(nome, imagem, { contentType: "image/webp" })
    if (error) throw error
    return nome
}

async function removerFoto(nome) {
    if (!nome) return
    try {
        const { error } = await supabase.storage.from("campanhas").remove([nome])
        if (error) console.error("Falha ao apagar foto órfã:", nome, error.message)
    } catch (e) {
        console.error("Falha ao apagar foto órfã:", nome, e.message)
    }
}
const TIPOS_SANGUINEOS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
const URGENCIAS = ["urgente", "moderada", "regular"]

function dataValida(valor) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(valor || "")) return false
    const [ano, mes, dia] = valor.split("-").map(Number)
    const data = new Date(ano, mes - 1, dia)
    return data.getFullYear() === ano && data.getMonth() === mes - 1 && data.getDate() === dia
}

function validarCamposCampanha(body, { edicao = false } = {}) {
    const nome = (body.nome || "").trim()
    const descricao = (body.descricao || "").trim()
    const urgencia = (body.urgencia || "").toLowerCase()
    const { tipoSanguineo, dataInicio, dataFechamento } = body
    const erros = []

    if (!nome) erros.push("Informe o nome.")
    else if (nome.length > 100) erros.push("O nome deve ter até 100 caracteres.")            // confira o tamanho real da coluna
    if (!descricao) erros.push("Informe uma descrição.")
    else if (descricao.length > 1000) erros.push("A descrição deve ter até 1000 caracteres.") // idem
    if (!TIPOS_SANGUINEOS.includes(tipoSanguineo)) erros.push("Selecione o tipo sanguíneo.")
    if (!URGENCIAS.includes(urgencia)) erros.push("Selecione a urgência.")

    if (!dataValida(dataInicio)) erros.push("Data de início inválida.")

    if (!dataValida(dataFechamento)) erros.push("Data de fechamento inválida.")
    else if (dataFechamento < hoje.hojeFortaleza()) erros.push("A data de fechamento não pode estar no passado.")

    if (dataValida(dataInicio) && dataValida(dataFechamento) && dataFechamento < dataInicio) {
        erros.push("A data de encerramento não pode ser anterior à de início.")
    }

    return { erros, valores: { nome, descricao, tipoSanguineo, urgencia, dataInicio, dataFechamento } }
}


function renderErroCampanha(req, res, status, erros, campanhaEdicao = null) {
    const lista = req.file ? [...erros, "Selecione a foto novamente."] : erros
    return res.status(status).render("criacao_campanhas", {
        title: campanhaEdicao ? "Editar Campanha" : "Criação Campanha",
        cssExtra: "campanhaNova",
        ...configFormCampanha(campanhaEdicao),
        fotoAtualUrl: campanhaEdicao && campanhaEdicao.foto ? urlFoto(campanhaEdicao.foto) : null,
        erros: lista,
        dados: req.body
    })
}



async function logar(req,res) {
    const rotulos = {
        pendente: "Aguardando validação",
        recusado: "Cadastro recusado"
    }
    try {
        const hemocentro = await hemocentroDAO.buscarPorId(req.session.userID)
        if (!hemocentro) {
            return req.session.destroy(() => res.redirect("/login/hemocentro"))
        }
        req.session.statusHemocentro = hemocentro.status
        const bloqueadoBotoes = ["pendente","recusado"].includes(hemocentro.status)
        const campanhas = await campanhaDAO.listarPorHemocentro(req.session.userID)
       const campanhasComFoto = campanhas.map((c) => {
        const encerrada = estaEncerrada(c,hoje.hojeFortaleza()
        )
       return {
            ...c,
            status: encerrada ? "encerrada" : "ativa",encerrada,
            dataFechamentoFormatada: hoje.formatarData(c.data_fechamento),
            interessadosTexto: `${c.interessados} ${c.interessados === 1 ? "interessado" : "interessados"}`,
            dataEncerramentoFormatada: hoje.formatarData(c.encerrada_em || c.data_fechamento),
            fotoUrl:  urlFoto(c.foto),
            urgenciaLower: c.urgencia.toLowerCase(),
            urgenciaRotulo: rotuloUrgencia(c.urgencia),
            dataEncerramentoFormatada: hoje.formatarData(c.encerrada_em || c.data_fechamento)
        }
    })
         res.render("hemocentro_logado", {
            title: "Início",
            cssExtra: "homepageHemocentro",
            hemocentro,
            statusRotulo: rotulos[hemocentro.status] || hemocentro.status,
            bloqueadoBotoes,
            campanhas: campanhasComFoto
        })
    } catch(err) {
        console.log(err)
        res.status(500).send("Erro ao carregar a pagina.")
    }

}

async function listarDoadoresCampanha(req, res) {

    try {
        const campanha = req.campanha
        const idHemocentro = req.session.userID

        // não existe OU é de outro hemocentro: mesma resposta, sem revelar qual
        if (!campanha) return res.status(404).send("Campanha não encontrada.")

        const [interessados, contatos] = await Promise.all([
            campanhaDAO.listarInteressados(campanha.id_campanha, idHemocentro),
            contatosDAO.buscarPorIdHemocentro(idHemocentro)
        ])

        res.render("lista_doadores", {
            title: "Lista de Interessados",
            cssExtra: "listaInteressados",
            campanha: {
                id: campanha.id_campanha,
                encerrada: estaEncerrada(campanha),
                podeExcluir: interessados.length===0,
                imagem: urlFoto(campanha.foto),
                titulo: campanha.nome,
                descricao: campanha.descricao,
                urgencia: rotuloUrgencia(campanha.urgencia),
                urgenciaClasse: (campanha.urgencia || "").toLowerCase(),
                tipoSanguineo: campanha.tipo_sanguineo_necessario,
                dataInicio: hoje.formatarData(campanha.data_inicio),
                dataFechamento: hoje.formatarData(campanha.data_fechamento),
                interessados,
                contatos
            }
        })
    } catch (err) {
        console.error(err)
        res.status(500).send("Erro ao carregar a página.")
    }
}

function exibirCriacaoCampanha(req,res) {
     res.render("criacao_campanhas",{
        title: "Criação Campanha",
        loggedInHemocentro: true,
        cssExtra: "campanhaNova",
        ...configFormCampanha()
    })
}

async function criarCampanha(req, res) {
    if (req.erroUpload) return renderErroCampanha(req, res, 400, [req.erroUpload])

    const { erros, valores } = validarCamposCampanha(req.body)
    if (erros.length) return renderErroCampanha(req, res, 400, erros)

    let foto = null   // declarada fora do try, pra o catch enxergar
    if (req.file) {
        try {
            foto = await salvarFoto(req.file.buffer)
        } catch (err) {
            console.error(err)
            return err.message === "IMAGEM_INVALIDA"
                ? renderErroCampanha(req, res, 400, ["O arquivo enviado não é uma imagem válida (use JPG, PNG ou WebP)."])
                : renderErroCampanha(req, res, 500, ["Não foi possível salvar a imagem agora. Tente novamente."])
        }
    }

    try {
        await campanhaDAO.insertCampanha({ ...valores, foto, idHemocentro: req.session.userID })
        redirecionarComAviso(req, res, "sucesso", "Campanha criada com sucesso!", "/hemocentro")
    } catch (err) {
        console.error(err)
        await removerFoto(foto)   // o INSERT falhou, então a foto já enviada fica órfã
        renderErroCampanha(req, res, 500, ["Erro interno. Tente novamente."])
    }
}

function exibirEdicaoCampanha(req, res) {
    const campanha = req.campanha

    if (estaEncerrada(campanha)) {
        req.session.flash = { tipo: "erro", texto: "Campanhas encerradas não podem ser editadas." }
        return req.session.save(() => res.redirect(`/hemocentro/campanha/${campanha.id_campanha}`))
    }
    res.render("criacao_campanhas", {
        title: "Editar Campanha",
        cssExtra: "campanhaNova",
        ...configFormCampanha(campanha),
        fotoAtualUrl: campanha.foto ? urlFoto(campanha.foto) : null,
        dados: {
            nome: campanha.nome,
            descricao: campanha.descricao,
            tipoSanguineo: campanha.tipo_sanguineo_necessario,
            urgencia: (campanha.urgencia || "").toLowerCase(),
            dataInicio: campanha.data_inicio,          // já chega como AAAA-MM-DD (::text)
            dataFechamento: campanha.data_fechamento
        }
    })
}

async function editarCampanha(req, res) {
    const campanha = req.campanha
    const idHemocentro = req.session.userID
    const destinoDetalhe = `/hemocentro/listaCampanha/${campanha.id_campanha}`

    if (req.erroUpload) return renderErroCampanha(req, res, 400, [req.erroUpload], campanha)

    if (estaEncerrada(campanha)) {
        return redirecionarComAviso(req, res, "erro", "Campanhas encerradas não podem ser editadas.", destinoDetalhe)
    }

    const { erros, valores } = validarCamposCampanha(req.body, { edicao: true })
    if (erros.length) return renderErroCampanha(req, res, 400, erros, campanha)

    let fotoNova = null
    if (req.file) {
        try {
            fotoNova = await salvarFoto(req.file.buffer)
        } catch (err) {
            console.error(err)
            return err.message === "IMAGEM_INVALIDA"
                ? renderErroCampanha(req, res, 400, ["O arquivo enviado não é uma imagem válida (use JPG, PNG ou WebP)."], campanha)
                : renderErroCampanha(req, res, 500, ["Não foi possível salvar a imagem agora. Tente novamente."], campanha)
        }
    }

   
    try {
        const atualizada = await campanhaDAO.atualizarCampanha({
            id: campanha.id_campanha,
            idHemocentro,
            ...valores,
            foto: fotoNova
        })

        if (!atualizada) {
            await removerFoto(fotoNova)   
            return redirecionarComAviso(req, res, "erro", "Não foi possível atualizar esta campanha.", destinoDetalhe)
        }

       
        if (fotoNova && campanha.foto) await removerFoto(campanha.foto)

        redirecionarComAviso(req, res, "sucesso", "Campanha atualizada com sucesso!", destinoDetalhe)
    } catch (err) {
        console.error(err)
        await removerFoto(fotoNova)       // nunca apague a antiga aqui
        renderErroCampanha(req, res, 500, ["Erro interno. Tente novamente."], campanha)
    }

}

async function encerrarCampanha(req, res) {
    const campanha = req.campanha
    const destinoDetalhe = `/hemocentro/listaCampanha/${campanha.id_campanha}`

    try {
        const ok = await campanhaDAO.encerrarCampanha(campanha.id_campanha, req.session.userID, hoje.hojeFortaleza())

        if (!ok) {
            return redirecionarComAviso(req, res, "erro", "Esta campanha já está encerrada.", destinoDetalhe)
        }
        redirecionarComAviso(req, res, "sucesso", "Campanha encerrada.", destinoDetalhe)
    } catch (err) {
        console.error(err)
        redirecionarComAviso(req, res, "erro", "Erro interno. Tente novamente.", destinoDetalhe)
    }
}

async function excluirCampanha(req, res) {
    const campanha = req.campanha
    const destinoDetalhe = `/hemocentro/campanha/${campanha.id_campanha}`
    const msgBloqueio = "Não foi possível excluir. Campanhas com interessados devem ser encerradas."

    try {
        const excluida = await campanhaDAO.excluirCampanha(campanha.id_campanha, req.session.userID)

        if (!excluida) return redirecionarComAviso(req, res, "erro", msgBloqueio, destinoDetalhe)

        await removerFoto(excluida.foto)
        redirecionarComAviso(req, res, "sucesso", "Campanha excluída.", "/hemocentro")
    } catch (err) {
        console.error(err)
        // 23503: um interesse entrou entre a checagem e o DELETE; a chave estrangeira barrou
        const msg = err.code === "23503" ? msgBloqueio : "Erro interno. Tente novamente."
        redirecionarComAviso(req, res, "erro", msg, destinoDetalhe)
    }
}

module.exports = {
    logar,
    listarDoadoresCampanha,
    exibirCriacaoCampanha,
    criarCampanha,
    exibirEdicaoCampanha,
    editarCampanha,
    encerrarCampanha,
    excluirCampanha
}