import express from "express";
import { register, verifyOTP, login, verifyLogin, resendOTP, createLivreur } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.js";
import { roleMiddleware } from "../middlewares/roles.js";

const router = express.Router();

router.post("/register", register);
router.post("/verify", verifyOTP);
router.post("/login", login);
router.post("/verify-login", verifyLogin);
router.post("/resend-otp", resendOTP);

// Endpoint réservé aux admins pour créer un compte livreur
router.post("/admin/create-livreur", authMiddleware, roleMiddleware("ADMIN"), createLivreur);

export default router;
