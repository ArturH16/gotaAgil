const pool = require("../../db")

class interesseDAO {
     static async insertInteresse(idDoador, idCampanha, hoje) {
        const sql = `
            INSERT INTO tb_interesse (id_doador, id_campanha)
            SELECT $1::int, c.id_campanha
            FROM tb_campanha c
            JOIN tb_hemocentro h ON h.id_hemocentro = c.id_hemocentro
            WHERE c.id_campanha = $2::int
              AND h.status = 'aprovado'
              AND c.encerrada_em IS NULL
              AND c.data_inicio <= $3::date
              AND c.data_fechamento >= $3::date
            ON CONFLICT (id_doador, id_campanha) DO NOTHING
            RETURNING id_interesse`
        const { rows } = await pool.query(sql, [idDoador, idCampanha, hoje])
        return rows[0] || null
    }

    static async verificarInteresse(idDoador, idCampanha) {
        const sql = `
            SELECT id_interesse
            FROM tb_interesse
            WHERE id_doador = $1 AND id_campanha = $2`
        const { rows } = await pool.query(sql, [idDoador, idCampanha])
        return rows[0] || null
    }

    static async cancelarInteresse(idDoador, idCampanha) {
        const sql = `
            DELETE FROM tb_interesse i
            WHERE i.id_doador = $1 AND i.id_campanha = $2
              AND NOT EXISTS (SELECT 1 FROM tb_doacao d WHERE d.id_interesse = i.id_interesse)
            RETURNING i.id_interesse`
        const { rows } = await pool.query(sql, [idDoador, idCampanha])
        return rows[0] || null
    }

    static async listarPorDoador(idDoador) {
        const sql = `
            SELECT c.id_campanha, c.nome, c.urgencia,
                c.data_fechamento::text AS data_fechamento,
                c.encerrada_em::text AS encerrada_em,
                h.nome AS hemocentro
            FROM tb_interesse i
            JOIN tb_campanha c ON c.id_campanha = i.id_campanha
            JOIN tb_hemocentro h ON h.id_hemocentro = c.id_hemocentro
            WHERE i.id_doador = $1
            ORDER BY i.data DESC, i.id_interesse DESC
            LIMIT 50`
        const { rows } = await pool.query(sql, [idDoador])
        return rows
}
}

module.exports = interesseDAO