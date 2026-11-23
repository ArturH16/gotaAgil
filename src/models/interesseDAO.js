const pool = require("../../db")

class interesseDAO {
    static async insertInteresse(data,idDoador,idCampanha) {
        const sql = `INSERT INTO tb_interesse
        (data,id_doador,id_campanha)
        VALUES($1,$2,$3)
        RETURNING data,id_interesse`
        const valores = [data,idDoador,idCampanha]
        const rows = await pool.query(sql,valores)
        return rows[0]

    }


    static async verificarInteresse(idDoador,idCampanha) {
        const sql = `SELECT id_interesse,id_doador,id_campanha
        FROM tb_interesse
        WHERE id_doador = $1 AND
        id_campanha = $2`
        const valores = [idDoador,idCampanha]
        const rows = await pool.query(sql,valores)
        return rows[0] || null
    }
}

module.exports = interesseDAO