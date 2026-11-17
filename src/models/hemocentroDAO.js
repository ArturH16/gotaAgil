const pool = require("../../db")

class hemocentroDAO {

    static async insertHemocentro({nome,codigoCnes,senhaHash,email,cnpj,cidade,estado,logradouro,numero,cep,bairro}) {
        const sql = `INSERT INTO tb_hemocentro (nome,codigo_cnes,senha_hash,email,cnpj,cidade,estado,logradouro,numero,cep,bairro) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
        RETURNING id_hemocentro,nome, email,codigo_cnes, cidade, estado`
        const valores = [nome,codigoCnes,senhaHash,email,cnpj,cidade,estado,logradouro,numero,cep,bairro]
        const rows = await pool.query(sql,valores) 
    } 

}