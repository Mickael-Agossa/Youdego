const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// Inscription client/commercant
router.post('/register', AuthController.register);

// Connexion
router.post('/login', AuthController.login);

// Vérification code WhatsApp
router.post('/verify', AuthController.verifyCode);

// Mot de passe oublié / réinitialisation
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

// Création livreur (admin)
router.post('/admin/create-livreur', authMiddleware(['admin']), AuthController.createLivreur);

// Liste livreurs
router.get('/admin/livreurs', authMiddleware(['admin']), async (req, res) => {
  const UserModel = require('../models/userModel');
  const list = await UserModel.listLivreurs();
  res.status(200).json({ livreurs: list });
});

module.exports = router;
