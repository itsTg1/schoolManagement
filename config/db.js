const mysql = require("mysql2/promise");
require("dotenv").config();
const url = require("url");

let pool;

async function initDb() {
  if (pool) return pool;

  try {
    const dbUrl = process.env.DATABASE_URL;
    const { hostname, port, username, password, pathname } = new url.URL(dbUrl);

    pool = mysql.createPool({
      host: hostname,
      port: port,
      user: username,
      password: password,
      database: pathname.replace("/", ""),
      waitForConnections: true,
      connectionLimit: Number(process.env.DB_CONN_LIMIT || 10),
      queueLimit: 0,
    });

    await pool.query(`
      CREATE TABLE IF NOT EXISTS schools (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        address VARCHAR(255) NOT NULL,
        latitude DECIMAL(9,6) NOT NULL,
        longitude DECIMAL(9,6) NOT NULL,
        PRIMARY KEY (id),
        INDEX idx_lat_lng (latitude, longitude)
      );
    `);

    console.log("Connected to Railway DB & ensured table");
    return pool;
  } catch (err) {
    console.error("MySQL Init Error:", err);
    process.exit(1);
  }
}

module.exports = { initDb, getPool: () => pool };