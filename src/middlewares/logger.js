import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const loggerMiddleware = async (req, res, next) => {
  try {
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    await prisma.accessLog.create({
      data: {
        userId: req.user ? req.user.id : null,
        route: req.originalUrl,
        method: req.method,
        ip,
        userAgent: req.headers["user-agent"] || null,
      },
    });
  } catch (err) {
    console.error("Erreur log :", err);
  }
  next();
};
