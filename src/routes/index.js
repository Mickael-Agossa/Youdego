import express from "express";
import userRoutes from "./user.routes.js";
import deliveryRoutes from "./delivery.routes.js";
import mapLocationRoutes from "./mapLocation.routes.js";
import paymentRoutes from "./payment.routes.js";

const router = express.Router();

router.use("/auth", userRoutes);
router.use("/deliveries", deliveryRoutes);
router.use("/map-locations", mapLocationRoutes);
router.use("/payments", paymentRoutes);

export default router;
