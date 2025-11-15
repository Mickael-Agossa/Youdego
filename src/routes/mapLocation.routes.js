import express from "express";
import { authMiddleware } from "../middlewares/auth.js";
import { listMapLocations, getMapLocation } from "../controllers/mapLocation.controller.js";

const router = express.Router();

// Optionnel: ces endpoints peuvent être publics; ici on exige auth pour journalisation/cohérence
router.use(authMiddleware);

router.get("/", listMapLocations);
router.get("/:id", getMapLocation);

export default router;