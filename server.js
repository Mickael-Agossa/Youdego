const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require('path');
require('dotenv').config();

// Charger les variables d'environnement
dotenv.config();

// Connexion à la base de données
connectDB();

// Importer les routes

const app = express();

// Middleware pour parser le JSON

// Middleware pour parser les cookies
app.use(cookieParser());

// Middleware CORS
// TODO: Configurer CORS de manière plus stricte pour la production
// Exemple: app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(cors({ 
    origin: true, // Permettre toutes les origines pour le développement (à changer en production)
    credentials: true // Important pour les cookies httpOnly
}));

// Monter les routes

// Middleware de gestion des erreurs (simple exemple)
app.use((err, req, res, next) => {
  console.error("ERREUR GLOBALE:", err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || "Erreur Serveur Interne",
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(`Serveur démarré sur le port ${PORT}`)
);

// Gérer les rejets de promesses non gérés
process.on("unhandledRejection", (err, promise) => {
  console.error(`Erreur non gérée: ${err.message}`);
  // Fermer le serveur et quitter le processus
  server.close(() => process.exit(1));
});
