import dayjs from "dayjs";
import db from "../database";
import { v4 as uuidv4 } from "uuid";
import { getOneOrderItems, Item } from "./items";
import { randomBytes } from "crypto";

export enum CommandeStatus {
  CREATED = 1,
  PAID,
  PROGRESS,
  READY,
  DELIVERED,
}

export type Commande = {
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
  status: CommandeStatus;
};

type GetOptions = {
  query?: {
    embed?: "items";
    select?: (keyof Commande)[];
    extendSelect?: (keyof Commande)[];
  };
};

type EditData = {
  nom: string;
  mail: string;
  livraison: { date: string; heure: string };
  items?: { uri: string; q: number; libelle: string; tarif: number }[];
};

export const getAllOrders = async () =>
  await db
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

export const replaceOneOrder = async (id: Commande["id"], data: EditData) => {
  const { mail, nom, livraison } = data;
  const { date, heure } = livraison;

  if (mail && nom && livraison) {
    return await db
      .from<Commande>("commande")
      .where("id", id)
      .update({
        mail,
        nom,
        livraison: livraison
          ? dayjs(date + " " + heure, "D-M-YYYY h:m").toDate()
          : undefined,
      });
  } else {
    return undefined;
  }
};

export const createNewOrder = async (data: EditData) => {
  const { nom, mail, livraison, items } = data;
  const { date, heure } = livraison;

  if (nom && mail && livraison && date && heure && items) {
    const commande: Commande = {
      id: uuidv4(),
      created_at: dayjs().toDate(),
      livraison: dayjs(date + " " + heure, "D-M-YYYY h:m").toDate(),
      nom,
      mail,
      remise: 0,
      token: randomBytes(16).toString("hex"),
      status: CommandeStatus.CREATED,
    };

    const trx = await db.transaction();
    try {
      let montant = 0;
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
      await trx
        .from<Commande>("commande")
        .insert({ ...commande, montant })
        .then();
      await trx.commit();

      return commande.id;
    } catch (error) {
      await trx.rollback();

      throw new Error("Une erreur est survenue lors de l'ajout des items");
    }
  } else {
    return undefined;
  }
};
