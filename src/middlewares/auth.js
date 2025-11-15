import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const MAX_INACTIVITY_DAYS = 30;

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Non authentifié" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

  // Vérifier l'inactivité
    const now = new Date();
    if (user.lastActiveAt) {
  const diff = (now - user.lastActiveAt) / (1000 * 60 * 60 * 24); // en jours
      if (diff > MAX_INACTIVITY_DAYS) {
        return res.status(401).json({ message: "Session expirée pour inactivité" });
      }
    }

  // Mettre à jour la dernière activité
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: now },
    });

    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Token invalide ou expiré" });
  }
};
