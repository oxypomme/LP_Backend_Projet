import { CheckoutData } from "./checkout";
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
  status?: CommandeStatus;
} & Partial<CheckoutData>;

export type CommandeInput = {
  nom: string;
  mail: string;
  livraison: { date: Date; heure: string };
  items?: { uri: string; q: number; libelle: string; tarif: number }[];
};
