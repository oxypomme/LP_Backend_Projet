import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import db from "../database";

const router = Router();

type Item = {
  id: string;
  uri: string;
  libelle: string;
  tarif: number;
  quantite: number;
  command_id: string;
};

export const getItems = async (command: string) => {
  const items = await db
    .from<Item>("item")
    .select("id", "libelle", "tarif", "quantite")
    .where("command_id", command)
    .then();
  return items.map((c) => ({
    id: c.id,
    libelle: c.libelle,
    tarif: c.tarif,
    quantite: c.quantite,
  }));
};

router.get("/", async (req, res) => {
  try {
    res.sendPayload(await getItems(req.previous.params.id), "items");
  } catch (error) {
    res.sendError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Une erreur est survenue : " + (error as Error).message
    );
  }
});

// router.get("/:id", async (req, res) => {
// 	try {
// 		const commandes = await db
// 			.from<Commande>("commande")
// 			.select("id", "mail", "nom", "created_at", "livraison", "montant")
// 			.where("id", req.params.id)
// 			.limit(1)
// 			.then();
// 		if (commandes.length > 0) {
// 			const commande = commandes[0];
// 			res.sendPayload(
// 				{
// 					id: commande.id,
// 					mail_client: commande.mail,
// 					nom_client: commande.nom,
// 					date_commande: commande.created_at,
// 					date_livraison: commande.livraison,
// 					montant: commande.montant,
// 				},
// 				"commande"
// 			);
// 		} else {
// 			res.sendError(StatusCodes.NOT_FOUND, "Ressource non disponible");
// 		}
// 	} catch (error) {
// 		res.sendError(
// 			StatusCodes.INTERNAL_SERVER_ERROR,
// 			"Une erreur est survenue : " + (error as Error).message
// 		);
// 	}
// });

export default router;
