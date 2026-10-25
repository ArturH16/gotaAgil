//Arquivo de conexão com o banco
require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.URI,
});

module.exports = pool;