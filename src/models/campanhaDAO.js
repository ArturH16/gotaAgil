const pool = require("../../db")

class campanhaDAO {
    static async criarCampanha(nome,descricao,tipoSanguineo,urgencia,dataFechamento,foto,idHemocentro) {
        const sql = `INSERT INTO tb_campanha
        (nome,descricao,tipo_sanguineo_necessario,urgencia,data_fechamento,foto,id_hemocentro) VALUES ($1,$2,$3,$4,$5,$6,$7)
        RETURNING nome,descricao,tipo_sanguineo_necessario,urgencia,data_fechamento,foto,id_hemocentro`
        const valores = [nome,descricao,tipoSanguineo,urgencia,dataFechamento,foto,idHemocentro]
        const rows = await pool.query(sql,valores)
    }
}

module.exports = campanhaDAO