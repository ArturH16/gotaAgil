require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env.URI });

(async () => {
  try {
    const res = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
    );
    console.log("Conectou! Tabelas:");
    console.table(res.rows);
  } catch (err) {
    console.error("Falha na conexão:", err.message);
  } finally {
    await pool.end();
  }
})();