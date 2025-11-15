import { PrismaClient } from "@prisma/client";
import { generateOTP } from "../utils/generateCode.js";
import { sendWhatsAppMessageMeta } from "../services/whatsapp.service.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Création d'un compte livreur par un agent (admin)
export const createLivreur = async (req, res) => {
  try {
    const { fullname, phone, email, sexe } = req.body;

    if (!fullname || !phone) {
      return res.status(400).json({ message: "fullname et phone sont obligatoires" });
    }

    const exists = await prisma.user.findUnique({ where: { phone } });
    if (exists) return res.status(400).json({ message: "Ce numéro existe déjà" });

    const user = await prisma.user.create({
      data: {
        fullname,
        phone,
        email,
        sexe,
        role: 'LIVREUR',
      },
    });

    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    await prisma.oTPCode.create({ data: { code, userId: user.id, expiresAt } });

    await sendWhatsAppMessageMeta(
      phone,
      `Bonjour, votre compte livreur Youdégo a été créé par un agent. Code d'activation: ${code}`
    );

    return res.status(201).json({ message: "Livreur créé, code envoyé sur WhatsApp", livreurId: user.id });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// Création d'un compte par n'importe quel utilisateur

export const register = async (req, res) => {
  try {
    const { fullname, phone, email, sexe } = req.body;

    let user = await prisma.user.findUnique({ where: { phone } });
    if (user) return res.status(400).json({ message: "Ce numéro existe déjà" });

    user = await prisma.user.create({
      data: { fullname, 
              phone, 
              email, 
              sexe,
      },
    });

    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    await prisma.oTPCode.create({ data: { code, userId: user.id, expiresAt } });

    await sendWhatsAppMessageMeta(phone, `Votre code de validation Youdégo est : ${code}`);

    res.json({ message: "Code envoyé sur WhatsApp", userId: user.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


export const login = async (req, res) => {
  try {
    const { phone } = req.body;

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.oTPCode.create({ data: { code, userId: user.id, expiresAt } });

    await sendWhatsAppMessageMeta(phone, `Votre code de connexion Youdégo est : ${code}`);

    res.json({ message: "Code envoyé sur WhatsApp", userId: user.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const verifyLogin = async (req, res) => {
  try {
    const { userId, code } = req.body;

    const otp = await prisma.oTPCode.findFirst({
      where: { userId, code, used: false, expiresAt: { gt: new Date() } },
    });

    if (!otp) return res.status(400).json({ message: "Code invalide ou expiré" });

    await prisma.oTPCode.update({ where: { id: otp.id }, data: { used: true } });
    await prisma.user.update({ where: { id: userId }, data: { isWhatsappVerified: true } });

    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.TOKEN_EXPIRATION });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({ message: "Connecté avec succès", token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


export const verifyOTP = async (req, res) => {
  try {
    const { userId, code } = req.body;

    const otp = await prisma.oTPCode.findFirst({
      where: { userId, code, used: false, expiresAt: { gt: new Date() } },
    });

    if (!otp) return res.status(400).json({ message: "Code invalide ou expiré" });

    await prisma.oTPCode.update({ where: { id: otp.id }, data: { used: true } });
    await prisma.user.update({ where: { id: userId }, data: { isWhatsappVerified: true } });

    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.TOKEN_EXPIRATION });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({ message: "Vérifié avec succès", token });
  } catch (e) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await prisma.oTPCode.create({ data: { code, userId, expiresAt } });

    await sendWhatsAppMessageMeta(user.phone, `Votre nouveau code Youdégo est : ${code}`);

    res.json({ message: "Nouveau code envoyé sur WhatsApp" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

