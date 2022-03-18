"use strict";

import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import { getAllOrders, getOneOrder, updateOrder } from "../data/commandes.js";

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
    if(c) {
      res.sendPayload(
        {
          id: c.id,
          nom: c.nom,
          created_at: c.created_at,
          livraison: c.livraison,
          status: c.status,
          items: c.items
        },
        "commande"
      );
    } else {
      res.sendError(
        StatusCodes.NOT_FOUND,
        "Ressource non disponible"
      );
    }
  } catch (error) {
    res.sendError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Une erreur est survenue : " + error.message
    );
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const c = await getOneOrder(req.params.id);

    if(c) {
      if(req.body.status) {
        const status = new Number(req.body.status);
        if(status instanceof Number) {
          if(status.valueOf() === c.status + 1) {
            await updateOrder(c.id, { status: status.valueOf() });

            res.sendPayload(
              {
                id: c.id,
                nom: c.nom,
                created_at: c.created_at,
                livraison: c.livraison,
                status: status.valueOf(),
                items: c.items
              },
              "commande"
            );
          } else {
            res.sendError(
              StatusCodes.CONFLICT,
              "Vous qu'incrémenter le status"
            );
          }
        } else {
          res.sendError(
            StatusCodes.BAD_REQUEST,
            "Le paramètre donné (status) n'est pas valide"
          );
        }
      } else {
        res.sendError(
          StatusCodes.BAD_REQUEST,
          "Le paramètre 'status' est requis"
        );
      }
    } else {
      res.sendError(
        StatusCodes.NOT_FOUND,
        "Ressource non disponible"
      );
    }
  } catch (error) {
    res.sendError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Une erreur est survenue : " + error.message
    );
  }
});

export default router;
