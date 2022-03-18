import { randomBytes } from "crypto";
import type { CheckoutData, CheckoutInput } from "../types/checkout";
import { CheckoutType } from "../types/ECheckoutType";

/**
 * Mock function that simulate a online checkout
 *
 * @param data The input checkout
 */
export const doCheckout = (data: CheckoutInput): Promise<CheckoutData> => {
  return Promise.resolve({
    ref_paiement: randomBytes(16).toString("hex"),
    date_paiement: new Date(),
    mode_paiement: CheckoutType.CB,
  });
};
