const { Pool } = require('pg');
require('dotenv').config();

// Exporter 'pool'
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
});

const connectDB = async () => {
  try {
    // Vérifie la connexion en récupérant un client et en le relâchant
    const client = await pool.connect();
    client.release();
    console.log('Base de données connectée avec succès');
  } catch (error) {
    console.error('Échec de la connexion à la base de données:', error.message);
    process.exit(1);
  }
};

module.exports = { pool, connectDB, db: pool };