import db from "../database";

export type Item = {
  id: string;
  uri: string;
  libelle: string;
  tarif: number;
  quantite: number;
  command_id: string;
};

export const getOneOrderItems = async (order_id: string) => {
  const items = await db
    .from<Item>("item")
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
