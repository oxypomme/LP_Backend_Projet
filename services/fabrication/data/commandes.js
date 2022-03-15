"use strict";

import db from "../database.js";

export const getAllOrders = async () =>
  await db
    .from("commande")
    .select("id", "nom", "created_at", "livraison", "status")
    .then();
