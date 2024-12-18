import express from "express";
import { calculerScore, getGameHistory } from "../controller/scoreController";

const router = express.Router();

// Calcul du score pour une nouvelle partie
router.post("/calcul", calculerScore);

// Récupération de l'historique des parties
router.get("/history", getGameHistory);

export default router;
