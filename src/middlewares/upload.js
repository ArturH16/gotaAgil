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
        if (err) {
            req.erroUpload = err.code === "LIMIT_FILE_SIZE" ? "A imagem deve ter no máximo 5 MB."
                : err.message === "TIPO_INVALIDO" ? "Envie uma imagem JPG, PNG ou WebP."
                : "Não foi possível processar o arquivo."
        }
        next()
    })
}

module.exports = { receberFoto }