const multer = require("multer")

const upload = multer({
    storage: multer.memoryStorage(),            // fica na RAM, vamos processar e enviar
    limits: { fileSize: 5 * 1024 * 1024, files: 1 },
    fileFilter: (req, file, cb) => {
        const ok = ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)
        cb(ok ? null : new Error("TIPO_INVALIDO"), ok)
    }
})

// encapsulado pra devolver o erro no formulário, em vez de estourar uma exceção
function receberFoto(req, res, next) {
    upload.single("foto")(req, res, (err) => {
        if (!err) return next()

        const msg = err.code === "LIMIT_FILE_SIZE" ? "A imagem deve ter no máximo 5 MB."
            : err.message === "TIPO_INVALIDO" ? "Envie uma imagem JPG, PNG ou WebP."
            : "Não foi possível processar o arquivo."

        res.status(400).render("criacao_campanhas", {   
            title: "Criação campanha",
            erros: [msg],
            dados: req.body
        })
    })
}

module.exports = { receberFoto }