import { RequestHandler, Router } from "express";
import { StatusCodes } from "http-status-codes";
import {
  createNewOrder,
  getAllOrders,
  getOneOrder,
  replaceOneOrder,
} from "../data/commandes";
import itemsRouter from "./items";

const router = Router();

const auth: RequestHandler = async (req, res, next) => {
  const rt = req.query.token ?? req.get("X-lbs-token");
  if (rt) {
    const order = await getOneOrder(req.params.id, {
      query: { select: ["token"] },
    });
    if (rt === order?.token || !order) {
      next();
    } else {
      res.sendError(
        StatusCodes.FORBIDDEN,
        "Le token de la commande est érroné."
      );
    }
  } else {
    res.sendError(
      StatusCodes.UNAUTHORIZED,
      "Le token de la commande est nécéssaire."
    );
  }
};

router.get("/", async (req, res) => {
  try {
    const commandes = await getAllOrders();
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

router.post("/", async (req, res) => {
  try {
    const id = await createNewOrder(req.body);

    const commande = await getOneOrder(id, {
      query: {
        extendSelect: ["token"],
      },
    });

    if (commande) {
      res.status(StatusCodes.CREATED).sendPayload(
        {
          id: commande.id,
          mail_client: commande.mail,
          nom_client: commande.nom,
          date_commande: commande.created_at,
          date_livraison: commande.livraison,
          montant: commande.montant,
        },
        "commande",
        ["items"]
      );
    } else {
      res.sendError(StatusCodes.NOT_FOUND, "Ressource non disponible");
    }
  } catch (error) {
    res.sendError(
      (error as CustomError).status ?? StatusCodes.INTERNAL_SERVER_ERROR,
      "Une erreur est survenue : " + (error as Error).message
    );
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const commande = await getOneOrder(req.params.id, {
      query: req.query,
    });
    if (commande) {
      res.sendPayload(commande, "commande", ["items"]);
    } else {
      res.sendError(StatusCodes.NOT_FOUND, "Ressource non disponible");
    }
  } catch (error) {
    res.sendError(
      (error as CustomError).status ?? StatusCodes.INTERNAL_SERVER_ERROR,
      "Une erreur est survenue : " + (error as Error).message
    );
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const commande = await getOneOrder(req.params.id, {
      query: {
        select: ["id"],
      },
    });
    if (commande) {
      const result = await replaceOneOrder(req.params.id, req.body);
      if (result) {
        res.status(StatusCodes.NO_CONTENT).send({});
      } else {
        res.sendError(
          StatusCodes.NOT_ACCEPTABLE,
          "Le contenu envoyé n'est pas correct"
        );
      }
    } else {
      res.sendError(StatusCodes.NOT_FOUND, "Ressource non disponible");
    }
  } catch (error) {
    res.sendError(
      (error as CustomError).status ?? StatusCodes.INTERNAL_SERVER_ERROR,
      "Une erreur est survenue : " + (error as Error).message
    );
  }
});

router.use(
  "/:id/items",
  auth,
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
