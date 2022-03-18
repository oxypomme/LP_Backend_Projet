"use strict";

import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import { getAllOrders, getOneOrder } from "../data/commandes.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const commandes = await getAllOrders();
    res.sendPayload(
      commandes.map((c) => ({
        id: c.id,
        nom: c.nom,
        created_at: c.created_at,
        livraison: c.livraison,
        status: c.status,
      })),
      "commandes"
    );
  } catch (error) {
    res.sendError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Une erreur est survenue : " + error.message
    );
  }
});

router.get("/:id", async (req, res) => {
  try {
    const c = await getOneOrder(req.params.id);
    res.sendPayload(
      {
        id: c.id,
        nom: c.nom,
        created_at: c.created_at,
        livraison: c.livraison,
        status: c.status,
        items: c.items
      },
      "commandes"
    );
  } catch (error) {
    res.sendError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Une erreur est survenue : " + error.message
    );
  }
});

export default router;
