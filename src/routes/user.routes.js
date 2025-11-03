import express from "express";
import { register, verifyOTP, login, verifyLogin, resendOTP } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/verify", verifyOTP);
router.post("/login", login);
router.post("/verify-login", verifyLogin);
router.post("/resend-otp", resendOTP);

export default router;
