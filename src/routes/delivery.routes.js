import express from "express";
import { authMiddleware } from "../middlewares/auth.js";
import { roleMiddleware } from "../middlewares/roles.js";
import {
  createDelivery,
  updateCourierLocation,
  markPickedUp,
  markDelivered,
  cancelDelivery,
  getMyDeliveries,
  getDeliveryById,
  adminStats,
  listPenalties,
  trackingInfo,
  streamTracking,
  declineDelivery,
  rateDelivery,
  getDeliveryRating,
  courierRatingSummary,
  listMyDeclines,
  adminListDeclines,
  setCourierAvailability,
} from "../controllers/delivery.controller.js";
const router = express.Router();

// Toutes ces routes nécessitent une authentification
router.use(authMiddleware);

// Création d'une livraison (client ou commerçant)
router.post("/", roleMiddleware("CLIENT", "COMMERCANT", "ADMIN"), createDelivery);

// Récupération de mes livraisons (client/commerçant/livreur)
router.get("/me", getMyDeliveries);

// Détails d'une livraison (accès si concerné : créateur, livreur assigné, admin)
router.get("/:id", getDeliveryById);
// Suivi ponctuel (polling)
router.get("/:id/tracking", trackingInfo);
// Suivi temps réel (SSE)
router.get("/:id/stream", trackingInfo, streamTracking);

// Mise à jour de l'adresse actuelle du livreur
router.post("/courier/location", roleMiddleware("LIVREUR"), updateCourierLocation);
// Basculer la disponibilité du livreur
router.post("/courier/availability", roleMiddleware("LIVREUR"), setCourierAvailability);

// Changement d'état par le livreur
router.post("/:id/pickup", roleMiddleware("LIVREUR", "ADMIN"), markPickedUp);
  // Décliner une livraison (livreur)
  router.post("/:id/decline", roleMiddleware("LIVREUR"), declineDelivery);
router.post("/:id/deliver", roleMiddleware("LIVREUR", "ADMIN"), markDelivered);

// Annulation (admin)
router.post("/:id/cancel", roleMiddleware("ADMIN"), cancelDelivery);

// Administration : stats et pénalités
router.get("/admin/stats", roleMiddleware("ADMIN"), adminStats);
  // Noter le livreur (après livraison livrée, par créateur)
  router.post("/:id/rate", roleMiddleware("CLIENT", "COMMERCANT", "ADMIN"), rateDelivery);
  router.get("/:id/rating", getDeliveryRating);
  // Résumé des notes d'un livreur
  router.get("/courier/:courierId/ratings/summary", courierRatingSummary);
router.get("/admin/penalties", roleMiddleware("ADMIN"), listPenalties);
  // Déclinaisons
  router.get("/declines/me", roleMiddleware("LIVREUR"), listMyDeclines);
  router.get("/admin/declines", roleMiddleware("ADMIN"), adminListDeclines);

export default router;
