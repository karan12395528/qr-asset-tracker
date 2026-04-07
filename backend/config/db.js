const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.HOST,
  port: process.env.PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  ssl: {
    ca: fs.readFileSync(
      path.join(__dirname, '../certs/ca.pem')
    ),
  },
});

(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Database connected successfully");

    connection.release(); 
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
  }
})();

module.exports = pool;