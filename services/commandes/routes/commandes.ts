import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import db from "../database";
import itemsRouter, { getItems } from "./items";

const router = Router();

type Commande = {
  id: string;
  created_at: Date;
  updated_at?: Date;
  livraison: Date;
  nom: string;
  mail: string;
  montant?: number;
  remise?: number;
  token?: string;
  client_id?: number;
  ref_paiement?: string;
  date_paiement?: Date;
  mode_paiement?: number;
  status: number;
};

router.get("/", async (req, res) => {
  try {
    const commandes = await db
      .from<Commande>("commande")
      .select("id", "mail", "created_at", "montant")
      .then();
    res.sendPayload(
      commandes.map((c) => ({
        id: c.id,
        mail_client: c.mail,
        date_commande: c.created_at,
        montant: c.montant,
      })),
      "commandes"
    );
  } catch (error) {
    res.sendError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Une erreur est survenue : " + (error as Error).message
    );
  }
});

router.get("/:id", async (req, res) => {
  try {
    const commandes = await db
      .from<Commande>("commande")
      .select("id", "mail", "nom", "created_at", "livraison", "montant")
      .where("id", req.params.id)
      .limit(1)
      .then();
    if (commandes.length > 0) {
      const baseURL = req.protocol + "://" + req.get("host") + req.originalUrl;
      const commande = commandes[0];

      let items = undefined;
      if (req.query.embed === "items") {
        items = await getItems(req.params.id);
      }

      res.sendPayload(
        {
          id: commande.id,
          mail_client: commande.mail,
          nom_client: commande.nom,
          date_commande: commande.created_at,
          date_livraison: commande.livraison,
          montant: commande.montant,
          items,
        },
        "commande",
        {
          self: {
            href: baseURL,
          },
          items: {
            href: baseURL + "/items",
          },
        }
      );
    } else {
      res.sendError(StatusCodes.NOT_FOUND, "Ressource non disponible");
    }
  } catch (error) {
    res.sendError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Une erreur est survenue : " + (error as Error).message
    );
  }
});

router.put("/:id", async (req, res) => {
  try {
    const commandes = await db
      .from<Commande>("commande")
      .select("id")
      .where("id", req.params.id)
      .limit(1)
      .then();
    if (commandes.length > 0) {
      const {
        mail_client: mail,
        nom_client: nom,
        date_livraison: livraison,
      } = req.body;
      if (mail && nom && livraison) {
        await db
          .from<Commande>("commande")
          .where("id", req.params.id)
          .update({
            mail,
            nom,
            livraison: livraison && new Date(livraison),
          });
        res.status(StatusCodes.NO_CONTENT).send({});
      } else {
        res.sendError(
          StatusCodes.NOT_ACCEPTABLE,
          "Le contenu envoyé n'est pas correct"
        );
      }
    } else {
      res.sendError(StatusCodes.NOT_FOUND, "Ressourcee non disponible");
    }
  } catch (error) {
    res.sendError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Une erreur est survenue : " + (error as Error).message
    );
  }
});

router.use(
  "/:id/items",
  (req, res, next) => {
    req.previous = {
      params: req.params,
      query: req.query,
      body: req.body,
    };
    next();
  },
  itemsRouter
);

export default router;
