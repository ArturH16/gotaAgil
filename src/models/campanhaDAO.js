const pool = require("../../db")

class campanhaDAO {
    static async insertCampanha({nome,descricao,tipoSanguineo,urgencia,dataInicio,dataFechamento,foto,idHemocentro}) {
        const sql = `INSERT INTO tb_campanha
        (nome,descricao,tipo_sanguineo_necessario,urgencia,data_inicio,data_fechamento,foto,id_hemocentro) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        RETURNING  id_campanha,nome,descricao,tipo_sanguineo_necessario,urgencia,data_inicio,data_fechamento,foto,id_hemocentro`
        const valores = [nome,descricao,tipoSanguineo,urgencia,dataInicio,dataFechamento,foto,idHemocentro]
        const rows = await pool.query(sql,valores)
        return rows[0]
    }

    static async listarPorHemocentro(idHemocentro) {
        const sql = `
            SELECT c.id_campanha, c.nome, c.descricao, c.tipo_sanguineo_necessario, c.urgencia,
                c.data_inicio::text AS data_inicio,
                c.data_fechamento::text AS data_fechamento,
                c.foto,
                COUNT(i.id_interesse)::int AS interessados
                FROM tb_campanha c
                LEFT JOIN tb_interesse i ON i.id_campanha = c.id_campanha
                WHERE c.id_hemocentro = $1
                GROUP BY c.id_campanha
                ORDER BY c.data_fechamento DESC`
        const { rows } = await pool.query(sql, [idHemocentro])
        return rows
}

    static async buscarPorId(id, idHemocentro) {
        const sql = `
            SELECT c.id_campanha, c.nome, c.descricao, c.tipo_sanguineo_necessario, c.urgencia,
                c.data_inicio::text AS data_inicio,
                c.data_fechamento::text AS data_fechamento,
                c.foto,
                COUNT(i.id_interesse)::int AS interessados
                FROM tb_campanha c
                LEFT JOIN tb_interesse i ON i.id_campanha = c.id_campanha
                WHERE c.id_campanha = $1 AND c.id_hemocentro = $2
                GROUP BY c.id_campanha`
        const { rows } = await pool.query(sql, [id, idHemocentro])
        return rows[0] || null
}

    static async listarInteressados(idCampanha, idHemocentro) {
        const sql = `
            SELECT d.id_doador, d.nome, d.email, d.tipo_sanguineo, d.cidade, d.estado
            FROM tb_interesse i
            JOIN tb_doador d ON d.id_doador = i.id_doador
            JOIN tb_campanha c ON c.id_campanha = i.id_campanha
            WHERE i.id_campanha = $1 AND c.id_hemocentro = $2
            ORDER BY i.data DESC`
        const { rows } = await pool.query(sql, [idCampanha, idHemocentro])
        return rows
}
}

module.exports = campanhaDAO