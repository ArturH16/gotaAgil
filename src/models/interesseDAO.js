const pool = require("../../db")

class interesseDAO {
    static async insertInteresse(data,idDoador,idCampanha) {
        const sql = `INSERT INTO tb_interesse
        (data,id_doador,id_campanha)
        VALUES($1,$2,$3)
        RETURNING data`
        const valores = [data,idDoador,idCampanha]
        const rows = await pool.query(sql,valores)
        return rows[0]

    }


    // static async verificarInteresse(idDoador,idCampanha) {

    // }
}

module.exports = interesseDAO