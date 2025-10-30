const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = async () => {
  try {
    // Utilisation de l'URI de connexion depuis les variables d'environnement
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connecté: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Erreur de connexion à MongoDB: ${error.message}`);
    // Quitte le processus avec un code d'erreur en cas d'échec de la connexion
    process.exit(1);
  }
};

module.exports = connectDB;

