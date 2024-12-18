import { Request, Response } from "express";
import Game from "../models/Game";

const QUILLES_PAR_FRAME = 15;
const SCORE_REGULIER_MAX = 14;
const SCORE_FRAME_PARFAIT = 60;
const TOTAL_FRAMES = 5;

const calculerScoreFrame = (
  lancersActuels: number[],
  prochainLancers: number[][],
  estDerniereFrame: boolean = false
): number => {
  if (lancersActuels[0] === QUILLES_PAR_FRAME) {
    return calculerScoreStrike(
      lancersActuels,
      prochainLancers,
      estDerniereFrame
    );
  }

  const totalQuilles = lancersActuels.reduce(
    (sum, quilles) => sum + quilles,
    0
  );
  if (
    totalQuilles === QUILLES_PAR_FRAME &&
    lancersActuels[0] !== QUILLES_PAR_FRAME
  ) {
    return calculerScoreSpare(prochainLancers, estDerniereFrame);
  }

  return Math.min(totalQuilles, SCORE_REGULIER_MAX);
};

const calculerScoreStrike = (
  lancersActuels: number[],
  prochainLancers: number[][],
  estDerniereFrame: boolean
): number => {
  if (estDerniereFrame) return QUILLES_PAR_FRAME;

  const prochainisFrame = prochainLancers[0]?.[0] === QUILLES_PAR_FRAME;
  const deuxiemeisFrame = prochainLancers[1]?.[0] === QUILLES_PAR_FRAME;
  const troisiemeisFrame = prochainLancers[2]?.[0] === QUILLES_PAR_FRAME;

  if (prochainisFrame && deuxiemeisFrame && troisiemeisFrame) {
    return SCORE_FRAME_PARFAIT;
  }

  if (prochainisFrame && deuxiemeisFrame) {
    return QUILLES_PAR_FRAME * 3;
  }

  const quillesBonus = prochainLancers.flat().slice(0, 3);
  return (
    QUILLES_PAR_FRAME + quillesBonus.reduce((sum, quilles) => sum + quilles, 0)
  );
};

const calculerScoreSpare = (
  prochainLancers: number[][],
  estDerniereFrame: boolean
): number => {
  if (estDerniereFrame) return QUILLES_PAR_FRAME;

  const prochainisFrame = prochainLancers[0]?.[0] === QUILLES_PAR_FRAME;
  const deuxiemeisFrame = prochainLancers[1]?.[0] === QUILLES_PAR_FRAME;

  if (prochainisFrame && deuxiemeisFrame) {
    return QUILLES_PAR_FRAME * 3;
  }

  const quillesBonus = prochainLancers.flat().slice(0, 2);
  return (
    QUILLES_PAR_FRAME + quillesBonus.reduce((sum, quilles) => sum + quilles, 0)
  );
};

export const calculerScore = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { playerName, frames } = req.body;

    if (!playerName || !frames || frames.length !== TOTAL_FRAMES) {
      res.status(400).json({
        message: `Entrée invalide: Nom du joueur et exactement ${TOTAL_FRAMES} frames requis`,
      });
      return;
    }

    let scoreTotal = 0;
    let strikesConsecutifs = 0;

    const framesCalcules = frames.map((lancers: number[], index: number) => {
      if (
        !Array.isArray(lancers) ||
        lancers.some((quilles) => quilles < 0 || quilles > QUILLES_PAR_FRAME)
      ) {
        throw new Error(
          `Nombre de quilles invalide dans la frame ${index + 1}`
        );
      }

      strikesConsecutifs =
        lancers[0] === QUILLES_PAR_FRAME ? strikesConsecutifs + 1 : 0;

      const scoreFrame = calculerScoreFrame(
        lancers,
        frames.slice(index + 1),
        index === TOTAL_FRAMES - 1
      );
      scoreTotal += scoreFrame;

      return {
        lancers,
        scoreFrame,
        isFrame: lancers[0] === QUILLES_PAR_FRAME,
        isSpare:
          lancers.reduce((sum, quilles) => sum + quilles, 0) ===
            QUILLES_PAR_FRAME && lancers[0] !== QUILLES_PAR_FRAME,
      };
    });

    const estPartieParfaite =
      strikesConsecutifs === TOTAL_FRAMES && scoreTotal === 300;

    const partie = new Game({
      playerName,
      frames: framesCalcules,
      scoreTotal,
      date: new Date(),
    });

    await partie.save();

    res.json({
      partie,
      scoreTotal,
      frames: framesCalcules,
      estPartieParfaite,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Erreur lors du calcul du score",
      error: error.message,
    });
  }
};

export const getGameHistory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const parties = await Game.find().sort({ date: -1 }).limit(10);
    res.json(parties);
  } catch (error: any) {
    res.status(500).json({
      message: "Erreur lors de la récupération de l'historique",
      error: error.message,
    });
  }
};
