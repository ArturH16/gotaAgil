const pool = require("../../db")

class doadorDAO {

    //INSERIR DOADOR
    static async insertDoador({nome, email, senhaHash, tipoSanguineo,cpf,peso,cidade,estado,dataNascimento}) {
      const sql = `
        INSERT INTO tb_doador
          (nome, email, senha_hash, tipo_sanguineo, cpf, peso, cidade, estado, data_nascimento)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id_doador, nome, email, tipo_sanguineo, cidade, estado`
      const valores = [nome,email,senhaHash,tipoSanguineo,cpf,peso,cidade,estado,dataNascimento]
      
      const rows = await pool.query(sql,valores)
        
    }

    static async buscarPorNome(nome_) {
      const sql = `SELECT id_doador, nome, email, senha_hash, tipo_sanguineo, cidade, estado 
                  FROM tb_doador 
                  WHERE nome = $1`
      const nome = [nome_]
      const result = await pool.query(sql, nome)
      return result.rows[0] || null;
}

}

module.exports = doadorDAO