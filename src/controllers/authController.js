const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const UserModel = require('../models/userModel');
const WhatsappModel = require('../models/whatsappModel');
const { sendWhatsAppMessage } = require('../utils/whatsapp');
const PasswordResetModel = require('../models/passwordResetModel');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key';
// 5 digits code
const generateCode = () => String(Math.floor(10000 + Math.random() * 90000));

class AuthController {
  // Inscription (client ou commerçant)
  static async register(req, res) {
    try {
  const { firstName, lastName, fullname: legacyFullname, email, phone, password } = req.body;
      const fullname = (firstName || lastName)
        ? `${(firstName || '').trim()} ${(lastName || '').trim()}`.trim()
        : (legacyFullname || '').trim();

      if (!fullname || !email || !phone || !password) {
        return res.status(400).json({ message: 'Champs requis manquants: prénom/nom (ou fullname), email, phone, password' });
      }

      const exists = await UserModel.findByPhone(phone);
      if (exists) return res.status(400).json({ message: "Téléphone déjà utilisé." });

      const emailExists = await UserModel.findByEmail(email);
      if (emailExists) return res.status(400).json({ message: "Email déjà utilisé." });

  // Par défaut, on n'assigne plus de rôle pour les inscriptions standards (client/commerçant)
  const user = await UserModel.createUser({ fullname, email, phone, password });

      const code = generateCode();
      await WhatsappModel.createToken(user.id, code);
  await sendWhatsAppMessage(phone, `Votre code Youdégo : ${code} (valable 30 jours)`);

      res.status(201).json({ message: "Inscription réussie. Code envoyé par WhatsApp.", user });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Connexion
  static async login(req, res) {
    try {
      const { phone, password } = req.body;
      const user = await UserModel.findByPhone(phone);
      if (!user) return res.status(404).json({ message: "Utilisateur introuvable." });

      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ message: "Mot de passe incorrect." });

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '90d' });

      // Prolonger ou recréer token WhatsApp
      const code = generateCode();
      await WhatsappModel.revokeTokens(user.id);
      await WhatsappModel.createToken(user.id, code);
      await sendWhatsAppMessage(phone, `Code de vérification : ${code} (valable 30 jours)`);

      res.status(200).json({
        message: "Connexion réussie. Code envoyé par WhatsApp.",
        token,
        user: { id: user.id, fullname: user.fullname, role: user.role }
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Création livreur par admin
  static async createLivreur(req, res) {
    try {
      const { firstName, lastName, fullname: legacyFullname, email, phone, password, vehicle_plate, id_document_type, id_document_number, id_document_url, profile_photo_url } = req.body;

      const fullname = (firstName || lastName)
        ? `${(firstName || '').trim()} ${(lastName || '').trim()}`.trim()
        : (legacyFullname || '').trim();

      if (!fullname || !email || !phone || !password) {
        return res.status(400).json({ message: 'Champs requis manquants: prénom/nom (ou fullname), email, phone, password' });
      }

      const exists = await UserModel.findByPhone(phone);
      if (exists) return res.status(400).json({ message: "Téléphone déjà utilisé." });

      const emailExists = await UserModel.findByEmail(email);
      if (emailExists) return res.status(400).json({ message: "Email déjà utilisé." });

      const livreur = await UserModel.createUser({
        fullname,
        email,
        phone,
        password,
        role: 'livreur',
        vehicle_plate,
        id_document_type,
        id_document_number,
        id_document_url,
        profile_photo_url,
        registration_status: 'pending'
      });

      const code = generateCode();
      await WhatsappModel.createToken(livreur.id, code);
      await sendWhatsAppMessage(phone, `Compte livreur créé. Code : ${code} (valable 30 jours)`);

      res.status(201).json({ message: "Livreur créé avec succès.", livreur });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Vérification du code WhatsApp
  static async verifyCode(req, res) {
    try {
      const { userId, code } = req.body;
      const result = await WhatsappModel.verifyCode(userId, code);

      if (!result.ok)
        return res.status(400).json({ message: "Code invalide ou expiré." });

      await UserModel.setWhatsappVerified(userId, true);
      res.status(200).json({ message: "Compte vérifié via WhatsApp.", expires_at: result.expires_at });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Mot de passe oublié: envoi d'un code par WhatsApp
  static async forgotPassword(req, res) {
    try {
      const { phone, email } = req.body;
      if (!phone && !email) {
        return res.status(400).json({ message: 'Fournir phone ou email' });
      }

      let user = null;
      if (phone) user = await UserModel.findByPhone(phone);
      if (!user && email) user = await UserModel.findByEmail(email);

      // Réponse neutre pour éviter l'énumération d'utilisateurs
      if (!user) {
        return res.status(200).json({ message: 'Si un compte existe, un code a été envoyé.' });
      }

      // Révoque les anciens tokens et en crée un nouveau
      await PasswordResetModel.revokeTokens(user.id);
      const code = generateCode();
      await PasswordResetModel.createToken(user.id, code, 15);
      await sendWhatsAppMessage(user.phone, `Réinitialisation du mot de passe: code ${code} (15 min)`);

      res.status(200).json({ message: 'Code de réinitialisation envoyé par WhatsApp.' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Réinitialisation du mot de passe avec code
  static async resetPassword(req, res) {
    try {
      const { phone, email, userId, code, newPassword } = req.body;
      if (!code || !newPassword) {
        return res.status(400).json({ message: 'Champs requis manquants: code, newPassword' });
      }

      let user = null;
      if (userId) user = await UserModel.findById(userId);
      if (!user && phone) user = await UserModel.findByPhone(phone);
      if (!user && email) user = await UserModel.findByEmail(email);
      if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });

      const result = await PasswordResetModel.verifyCode(user.id, code);
      if (!result.ok) return res.status(400).json({ message: 'Code invalide ou expiré.' });

      await UserModel.updatePassword(user.id, newPassword);
      // Par sécurité, invalider tout autre token en cours
      await PasswordResetModel.revokeTokens(user.id);

      res.status(200).json({ message: 'Mot de passe réinitialisé avec succès.' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = AuthController;
