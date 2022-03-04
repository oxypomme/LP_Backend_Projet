import type { CommandeStatus } from "./ECommandeStatus";

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

export type CommandeInput = {
  nom: string;
  mail: string;
  livraison: { date: Date; heure: string };
  items?: { uri: string; q: number; libelle: string; tarif: number }[];
};
