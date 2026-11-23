const pool = require("../../db")

class hemocentroDAO {

    static async insertHemocentro({nome,codigoCnes,senhaHash,email,cnpj,cidade,estado,logradouro,numero,cep,bairro,contatos}) {
        const client = await pool.connect()
        try {
            await client.query("BEGIN")
            const sqlHemocentro = `INSERT INTO tb_hemocentro (nome,codigo_cnes,senha_hash,email,cnpj,cidade,estado,logradouro,numero,cep,bairro) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
            RETURNING id_hemocentro,nome, email,codigo_cnes, cidade, estado`
        const valores = [nome,codigoCnes,senhaHash,email,cnpj,cidade,estado,logradouro,numero,cep,bairro]
        const {rows} = await client.query(sqlHemocentro,valores)
        const hemocentroCriado = rows[0]
        
        if (contatos && contatos.length > 0) {
            const sqlContato= `INSERT INTO tb_contatos_hemocentro (contato,id_hemocentro,tipo_contato)
            VALUES ($1,$2,$3)`
            for (const item of contatos) {
                await client.query(sqlContato, [item.valor, hemocentroCriado.id_hemocentro,item.tipo])
            }
        }
        await client.query("COMMIT")
        return hemocentroCriado
        } catch(err) {
            await client.query("ROLLBACK")
            throw err;
        } finally {
            client.release()
        } 
    }

    static async buscarPorEmail(email_) {
        const sql = `SELECT id_hemocentro, nome,codigo_cnes,email, senha_hash, cidade, estado
        FROM tb_hemocentro 
        WHERE email = $1`
        const email = [email_]
        const result = await pool.query(sql, email)
      return result.rows[0] || null;
    }

    static async buscarPorId(id_) {
        const sql = `SELECT id_hemocentro, nome,codigo_cnes,email,cnpj,cidade, estado,logradouro,numero,cep,bairro,status
    FROM tb_hemocentro
    WHERE id_hemocentro = $1`
    const id = id_
    const {rows} = await pool.query(sql,[id])
    return rows[0] || null
    }
    
    static async listarInteressados(idCampanha, idHemocentro) {
    const sql = `
        SELECT d.id_doador, d.nome, d.email
        FROM tb_interesse i
        JOIN tb_doador d ON d.id_doador = i.id_doador
        JOIN tb_campanha c ON c.id_campanha = i.id_campanha
        WHERE i.id_campanha = $1 AND c.id_hemocentro = $2
        ORDER BY i.data DESC`
    const { rows } = await pool.query(sql, [idCampanha, idHemocentro])
    return rows
}

}

module.exports = hemocentroDAO