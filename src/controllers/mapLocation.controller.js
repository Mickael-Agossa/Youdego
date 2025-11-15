import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const listMapLocations = async (req, res) => {
  try {
    const { q } = req.query;
    const where = { active: true };
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { address: { contains: q, mode: 'insensitive' } },
      ];
    }
    const rows = await prisma.mapLocation.findMany({ where, orderBy: { name: 'asc' }, take: 100 });
    return res.json({ data: rows });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getMapLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const loc = await prisma.mapLocation.findUnique({ where: { id } });
    if (!loc || !loc.active) return res.status(404).json({ message: 'Emplacement introuvable' });
    return res.json({ data: loc });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};
