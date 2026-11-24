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
    //buscar por email

    static async buscarPorEmail(email_) {
      const sql = `SELECT id_doador, nome, email, senha_hash, tipo_sanguineo, cidade, estado 
                  FROM tb_doador 
                  WHERE email = $1`
      const email = [email_]
      const result = await pool.query(sql, email)
      return result.rows[0] || null;
}

//buscar por id

  static async buscarPorId(id_) {
    const sql = `SELECT id_doador, nome, email, tipo_sanguineo,cpf, data_nascimento, peso, cidade, estado
    FROM tb_doador
    WHERE id_doador = $1`
    const id = id_
    const {rows } = await pool.query(sql,[id])
    return rows[0] || null
  }

  static async buscarHashPorId(id) {
    const { rows } = await pool.query(
        "SELECT senha_hash FROM tb_doador WHERE id_doador = $1",
        [id]
    )
    return rows[0] ? rows[0].senha_hash : null
}

  static async atualizarSenha(id, senhaHash) {
      const { rows } = await pool.query(
          "UPDATE tb_doador SET senha_hash = $2 WHERE id_doador = $1 RETURNING id_doador",
          [id, senhaHash]
      )
      return rows[0] || null
  }

}

module.exports = doadorDAO