"use strict";

import db from "../database.js";

export const getOneOrderItems = async (order_id) => {
  const items = await db
    .from("item")
    .select("id", "libelle", "tarif", "quantite")
    .where("command_id", order_id)
    .then();
  return items.map((c) => ({
    id: c.id,
    libelle: c.libelle,
    tarif: c.tarif,
    quantite: c.quantite,
  }));
};
