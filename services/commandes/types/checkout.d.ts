import type { CheckoutType } from "./ECheckoutType";

export type CheckoutInput = {
  card: string;
  cvc: number;
  expires: string;
};

export type CheckoutData = {
  ref_paiement: string;
  date_paiement: Date;
  mode_paiement: CheckoutType;
};
