const supabase = require("../supabase")

const PLACEHOLDER = "/images/image-off.png"

function urlFoto(nome) {
    if (!nome) return PLACEHOLDER
    return supabase.storage.from("campanhas").getPublicUrl(nome).data.publicUrl
}

module.exports = { urlFoto }