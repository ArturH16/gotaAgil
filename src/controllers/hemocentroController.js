const hemocentroDAO = require("../models/hemocentroDAO")
const contatosDAO = require("../models/contatosDAO")
const campanhaDAO = require("../models/campanhaDAO")
const crypto = require("crypto")
const sharp = require("sharp")
const supabase = require("../supabase")
const { urlFoto } = require("../utils/fotos")
const { estaEncerrada } = require("../utils/campanhas")

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

function validarDataInicio(valor) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(valor || "")) return "Data de início inválida."
    const [ano, mes, dia] = valor.split("-").map(Number)
    const data = new Date(ano, mes - 1, dia)
    if (data.getFullYear() !== ano || data.getMonth() !== mes - 1 || data.getDate() !== dia) {
        return "Data de início inválida."
    }
    return null
}


function validarDataFechamento(valor) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(valor || "")) return "Data de fechamento inválida."
    const [ano, mes, dia] = valor.split("-").map(Number)
    const data = new Date(ano, mes - 1, dia)
    if (data.getFullYear() !== ano || data.getMonth() !== mes - 1 || data.getDate() !== dia) {
        return "Data de fechamento inválida."
    }
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    if (data < hoje) return "Data de fechamento inválida."
    return null
}

const hoje = new Date().toLocaleDateString("sv-SE", { timeZone: "America/Fortaleza" })  // AAAA-MM-DD
const formatarData = (iso) => iso.split("-").reverse().join("/")                         // dd/mm/aaaa

function renderErroCampanha(req, res, status, erros) {
    const lista = req.file ? [...erros, "Selecione a foto novamente."] : erros
    return res.status(status).render("criacao_campanhas", {
        title: "Criação Campanha",
        cssExtra: "campanhaNova",
        ...configFormCampanha(),
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
        const encerrada = estaEncerrada(c,hoje)
       return {
            ...c,
            status: encerrada ? "encerrada" : "ativa",
            dataFechamentoFormatada: formatarData(c.data_fechamento),
            interessadosTexto: `${c.interessados} ${c.interessados === 1 ? "interessado" : "interessados"}`,
            fotoUrl:  urlFoto(c.foto),
            urgenciaLower: c.urgencia.toLowerCase()
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
                imagem: urlFoto(campanha.foto),
                titulo: campanha.nome,
                descricao: campanha.descricao,
                urgencia: campanha.urgencia,
                tipoSanguineo: campanha.tipo_sanguineo_necessario,
                dataInicio: formatarData(campanha.data_inicio),
                dataFechamento: formatarData(campanha.data_fechamento),
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

async function criarCampanha(req,res) {
    const idHemocentro = req.session.userID
    const {nome,descricao,tipoSanguineo,urgencia,dataInicio,dataFechamento} = req.body
    const nomeNormalizado = (nome || "").trim()
    const descricaoNormalizada = (descricao || "").trim()

    const erros = []
    if (req.erroUpload) return renderErroCampanha(req, res, 400, [req.erroUpload])
    if (!nomeNormalizado) erros.push("Informe o nome.")
    if (!descricaoNormalizada) erros.push("Informe uma descrição.")
    const erroDataInicio = validarDataInicio(dataInicio)
    if (erroDataInicio) erros.push(erroDataInicio)
    const erroDataFechamento = validarDataFechamento(dataFechamento)
    if (erroDataFechamento) erros.push(erroDataFechamento)
    if (!erroDataInicio && !erroDataFechamento && dataFechamento < dataInicio) {
    erros.push("A data de encerramento não pode ser anterior à de início.")
    }
    if (erros.length) return renderErroCampanha(req, res, 400, erros)
    let foto = null
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
        const campanha = await campanhaDAO.insertCampanha({nome: nomeNormalizado,
            descricao: descricaoNormalizada,tipoSanguineo,urgencia,dataInicio,dataFechamento,foto,idHemocentro})
        req.session.flash = { tipo: "sucesso", texto: "Campanha criada com sucesso!" }
        req.session.save((err) => {
            if (err) console.error(err)
            res.redirect("/hemocentro")
        })
        
    } catch(err){
        console.log(err)
        await removerFoto(foto) 
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

module.exports = {
    logar,
    listarDoadoresCampanha,
    exibirCriacaoCampanha,
    criarCampanha,
    exibirEdicaoCampanha
}