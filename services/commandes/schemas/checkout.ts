import { StatusCodes } from "http-status-codes";
import Joi from "../joi";
import { CheckoutInput } from "../types/checkout";

const inputSchema = Joi.object({
  card: Joi.string().required(),
  cvc: Joi.number().required(),
  exp: Joi.date().format("MM/YY").greater("now").required(),
});

export const assertInputCheckout = async (
  data: unknown
): Promise<CheckoutInput> => {
  try {
    const value = await inputSchema.validateAsync(data);
    return value;
  } catch (error) {
    throw {
      status: StatusCodes.BAD_REQUEST,
      message: (error as Error).message,
    };
  }
};
