// db/connect.js
const { Pool } = require("pg");
require("dotenv").config();

// Verbindung zur Datenbank über die connectionString-Umgebungsvariable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // notwendig, damit SSL-Verbindung akzeptiert wird (für Railway)
  },
});

module.exports = pool;
