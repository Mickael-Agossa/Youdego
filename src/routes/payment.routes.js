import express from "express";
import { authMiddleware } from "../middlewares/auth.js";
import { roleMiddleware } from "../middlewares/roles.js";
import { initiatePayment, getPaymentById, myPayments, refreshPaymentStatus, adminListPayments, mtnCallback } from "../controllers/payment.controller.js";

const router = express.Router();

// Public callback endpoint (configure at MTN portal if used)
router.post("/mtn/callback", express.json({ type: "*/*" }), mtnCallback);

// Authenticated routes
router.use(authMiddleware);

router.post("/initiate", roleMiddleware("CLIENT", "COMMERCANT", "ADMIN"), initiatePayment);
router.get("/me", myPayments);
router.get("/:id", getPaymentById);
router.get("/:id/status", refreshPaymentStatus);

// Admin
router.get("/admin/list", roleMiddleware("ADMIN"), adminListPayments);

export default router;
