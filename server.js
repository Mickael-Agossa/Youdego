require('dotenv').config();
const app = require('./src/app');
const { connectDB } = require('./src/config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(` Serveur lancé sur le port ${PORT}`));
  } catch (error) {
    console.error("Erreur lors du démarrage :", error.message);
  }
};

startServer();
