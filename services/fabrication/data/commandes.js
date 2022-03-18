"use strict";

import db from "../database.js";
import { getOneOrderItems } from "./items.js";

export const getAllOrders = async () =>
  db
    .from("commande")
    .select("id", "nom", "created_at", "livraison", "status")
    .orderBy("livraison", "desc")
    .orderBy("created_at", "desc")
    .then();

export const getOneOrder = async (id) => {
  const commandes = await db
    .from("commande")
    .select(
      "id", "nom", "created_at", "livraison", "status"
    )
    .where("id", id)
    .limit(1)
    .then();
  if (commandes.length > 0) {
    return {
      ...commandes[0],
      items: await getOneOrderItems(id),
    };
  } else {
    return undefined;
  }
};
