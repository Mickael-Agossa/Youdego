import { PrismaClient } from "@prisma/client";
import { requestToPay, getRequestToPayStatus } from "../services/momo.service.js";

const prisma = new PrismaClient();

// Créer et initier un paiement (basique)
export const initiatePayment = async (req, res) => {
  try {
    const { amount, currency = "XOF", payerPhone, deliveryId } = req.body || {};
    if (typeof amount !== "number" || amount <= 0) return res.status(400).json({ message: "amount doit être un nombre > 0" });
    if (!payerPhone) return res.status(400).json({ message: "payerPhone est requis" });
    if (deliveryId) {
      const d = await prisma.delivery.findUnique({ where: { id: deliveryId } });
      if (!d) return res.status(404).json({ message: "Livraison introuvable" });
    }

    const payment = await prisma.payment.create({
      data: {
        createdById: req.user.id,
        deliveryId: deliveryId || null,
        amount,
        currency,
        provider: "MTN_MOMO",
        status: "PENDING",
        payerPhone,
      },
    });

    try {
      const r = await requestToPay({ amount, currency, payerMsisdn: payerPhone, externalId: payment.id });
      await prisma.payment.update({ where: { id: payment.id }, data: { providerReference: r.referenceId } });
    } catch (err) {
      await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED", externalMessage: String(err?.message || err) } });
      return res.status(502).json({ message: "Erreur MTN MoMo", error: String(err?.message || err) });
    }

    return res.status(201).json({ message: "Paiement initié", paymentId: payment.id });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// Récupérer un paiement (simple contrôle d'accès)
export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const p = await prisma.payment.findUnique({ where: { id } });
    if (!p) return res.status(404).json({ message: "Paiement introuvable" });
    if (p.createdById !== req.user.id && req.user.role !== "ADMIN") return res.status(403).json({ message: "Interdit" });
    return res.json({ data: p });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// Mes paiements
export const myPayments = async (req, res) => {
  try {
    const rows = await prisma.payment.findMany({ where: { createdById: req.user.id }, orderBy: { createdAt: "desc" } });
    return res.json({ data: rows });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// Rafraîchir le statut depuis MoMo (basique, sans events)
export const refreshPaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const p = await prisma.payment.findUnique({ where: { id } });
    if (!p) return res.status(404).json({ message: "Paiement introuvable" });
    if (p.createdById !== req.user.id && req.user.role !== "ADMIN") return res.status(403).json({ message: "Interdit" });
    if (!p.providerReference) return res.status(400).json({ message: "Référence MTN manquante" });

    const providerStatus = await getRequestToPayStatus(p.providerReference);
    const map = { PENDING: "PENDING", SUCCESSFUL: "SUCCESS", FAILED: "FAILED" };
    const newStatus = map[providerStatus.status] || p.status;
    if (newStatus !== p.status || providerStatus.reason) {
      await prisma.payment.update({ where: { id: p.id }, data: { status: newStatus, externalMessage: providerStatus.reason || null } });
    }
    return res.json({ data: { status: newStatus, provider: providerStatus } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// Liste admin simple
export const adminListPayments = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") return res.status(403).json({ message: "Interdit" });
    const { userId, deliveryId, status } = req.query;
    const where = {};
    if (userId) where.createdById = userId;
    if (deliveryId) where.deliveryId = deliveryId;
    if (status) where.status = status;
    const rows = await prisma.payment.findMany({ where, orderBy: { createdAt: "desc" } });
    return res.json({ data: rows });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// Callback minimal (optionnel)
export const mtnCallback = async (_req, res) => {
  res.status(200).json({ ok: true });
};
