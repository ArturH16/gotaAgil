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
                c.encerrada_em::text AS encerrada_em,
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
                c.encerrada_em::text AS encerrada_em,
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

        static async atualizarCampanha({ id, idHemocentro, nome, descricao, tipoSanguineo, urgencia, dataInicio, dataFechamento, foto }) {
        const sql = `
            UPDATE tb_campanha
            SET nome = $3, descricao = $4, tipo_sanguineo_necessario = $5, urgencia = $6,
                data_inicio = $7, data_fechamento = $8,
                foto = COALESCE($9, foto)
            WHERE id_campanha = $1 AND id_hemocentro = $2 AND encerrada_em IS NULL
            RETURNING id_campanha`
        const valores = [id, idHemocentro, nome, descricao, tipoSanguineo, urgencia, dataInicio, dataFechamento, foto]
        const { rows } = await pool.query(sql, valores)
        return rows[0] || null
    }

    static async encerrarCampanha(id, idHemocentro, hoje) {
        const sql = `
            UPDATE tb_campanha
            SET encerrada_em = $3
            WHERE id_campanha = $1 AND id_hemocentro = $2
            AND encerrada_em IS NULL AND data_fechamento >= $3
            RETURNING id_campanha`
        const { rows } = await pool.query(sql, [id, idHemocentro, hoje])
        return rows[0] || null
}

    static async excluirCampanha(id, idHemocentro) {
        const sql = `
            DELETE FROM tb_campanha c
            WHERE c.id_campanha = $1 AND c.id_hemocentro = $2
            AND NOT EXISTS (SELECT 1 FROM tb_interesse i WHERE i.id_campanha = c.id_campanha)
            RETURNING c.foto`
        const { rows } = await pool.query(sql, [id, idHemocentro])
        return rows[0] || null    // com foto nula devolve { foto: null }, que ainda é "apagou"
    }

    static async listarAbertas({ hoje, tipo = null, estado = null }) {
        const sql = `
            SELECT c.id_campanha, c.nome, c.tipo_sanguineo_necessario, c.urgencia,
                c.data_fechamento::text AS data_fechamento,
                c.foto,
                h.nome AS hemocentro, h.cidade, h.estado
            FROM tb_campanha c
            JOIN tb_hemocentro h ON h.id_hemocentro = c.id_hemocentro
            WHERE h.status = 'aprovado'
            AND c.encerrada_em IS NULL
            AND c.data_inicio <= $1::date
            AND c.data_fechamento >= $1::date
            AND ($2::text IS NULL OR c.tipo_sanguineo_necessario = $2)
            AND ($3::text IS NULL OR h.estado = $3)
            ORDER BY CASE lower(c.urgencia) WHEN 'urgente' THEN 1 WHEN 'moderada' THEN 2 ELSE 3 END,
                    c.data_fechamento ASC,
                    c.id_campanha ASC
            LIMIT 60`
        const { rows } = await pool.query(sql, [hoje, tipo, estado])
        return rows
}
}

module.exports = campanhaDAO