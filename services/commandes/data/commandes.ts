import { randomBytes } from "crypto";
import { v4 as uuidv4 } from "uuid";
import db from "../database";
import { doCheckout } from "../features/checkout";
import { assertInputCheckout } from "../schemas/checkout";
import { assertInputCommande } from "../schemas/commande";
import type { Commande } from "../types/commandes";
import { CommandeStatus } from "../types/ECommandeStatus";
import { getOneOrderItems, Item } from "./items";

type GetOptions = {
  query?: {
    embed?: "items";
    select?: (keyof Commande)[];
    extendSelect?: (keyof Commande)[];
  };
};

export const getAllOrders = () =>
  db
    .from<Commande>("commande")
    .select("id", "mail", "created_at", "montant")
    .then();

export const getOneOrder = async (id: Commande["id"], options: GetOptions) => {
  const commandes = await db
    .from<Commande>("commande")
    .select(
      options.query?.select ?? [
        "id",
        "mail",
        "nom",
        "created_at",
        "livraison",
        "montant",
        ...(options.query?.extendSelect ?? []),
      ]
    )
    .where("id", id)
    .limit(1)
    .then();
  if (commandes.length > 0) {
    const commande = commandes[0];

    let items = {};
    if (options.query?.embed === "items") {
      items = await getOneOrderItems(id);
    }

    return {
      ...commande,
      items,
    };
  } else {
    return undefined;
  }
};

export const replaceOneOrder = async (id: Commande["id"], data: unknown) => {
  // Validating parameters
  const { mail, nom, livraison } = await assertInputCommande(data);
  const { date, heure } = livraison;

  // Updating date with hour
  const hourArr = heure.split(":");
  date.setHours(+hourArr[0], +hourArr[1]);

  return db.from<Commande>("commande").where("id", id).update({
    mail,
    nom,
    livraison: date,
  });
};

export const checkoutOrder = async (id: Commande["id"], data: unknown) => {
  // Validating parameters
  const input = await assertInputCheckout(data);

  const checkout = await doCheckout(input);
  return db
    .from<Commande>("commande")
    .where("id", id)
    .update({
      ...checkout,
      status: CommandeStatus.PAID,
    });
};

export const createNewOrder = async (data: unknown) => {
  // Validating parameters
  const { nom, mail, livraison, items } = await assertInputCommande(data);
  const { date, heure } = livraison;

  // Updating date with hour
  const hourArr = heure.split(":");
  date.setHours(+hourArr[0], +hourArr[1]);

  const commande: Commande = {
    id: uuidv4(),
    created_at: new Date(),
    livraison: date,
    nom,
    mail,
    remise: 0,
    token: randomBytes(16).toString("hex"),
    status: CommandeStatus.CREATED,
  };

  const trx = await db.transaction();
  try {
    let montant = 0;
    if (items) {
      for (const item of items) {
        montant += item.tarif * item.q;
        await trx
          .from<Item>("item")
          .insert({
            uri: item.uri,
            libelle: item.libelle,
            tarif: item.tarif,
            quantite: item.q,
            command_id: commande.id,
          })
          .then();
      }
    }
    await trx
      .from<Commande>("commande")
      .insert({ ...commande, montant })
      .then();
    await trx.commit();

    return commande.id;
  } catch (error) {
    await trx.rollback();

    throw error;
  }
};
