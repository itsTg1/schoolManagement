const mysql = require("mysql2/promise");
require("dotenv").config();

async function initDb() {
  try {
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`
    );
    await connection.end();

    
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: Number(process.env.DB_CONN_LIMIT || 10),
      queueLimit: 0,
    });

    
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS schools (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        address VARCHAR(255) NOT NULL,
        latitude DECIMAL(9,6) NOT NULL,
        longitude DECIMAL(9,6) NOT NULL,
        PRIMARY KEY (id),
        INDEX idx_lat_lng (latitude, longitude)
      );
    `;
    await pool.query(createTableQuery);

    console.log("Database and table initialized");
    return pool;
  } catch (err) {
    console.error("DB Init Error:", err);
    process.exit(1);
  }
}


module.exports = initDb();
