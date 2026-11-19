const pool = require("../../db")

class ContatosDAO {
    static async buscarPorIdHemocentro(idHemocentro_) {
        const sql = `SELECT contato,tipo_contato,id_hemocentro
        FROM tb_contatos_hemocentro
        WHERE id_hemocentro = $1`
        const idHemocentro = [idHemocentro_]
        const result = await pool.query(sql, idHemocentro)
        return result.rows[0] || null;
    }
}

module.exports = ContatosDAO