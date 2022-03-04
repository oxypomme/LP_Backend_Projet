import { StatusCodes } from "http-status-codes";
import Joi from "../joi";
import { CommandeInput } from "../types/commandes";

const inputSchema = Joi.object({
  nom: Joi.string().required().regex(/[a-z]/i),
  mail: Joi.string().email().required(),
  livraison: Joi.object({
    // D-M-YYYY
    date: Joi.date().format("D-M-YYYY").greater("now"),
    // H:m
    heure: Joi.string().regex(/^(\d|1\d|2[0-3]):(\d|1\d|2\d|3\d|4\d|5\d)$/),
  }).required(),
  items: Joi.array()
    .items(
      Joi.object({
        uri: Joi.string().required(),
        q: Joi.number().min(1).required(),
        libelle: Joi.string().required(),
        tarif: Joi.number().min(0).required(),
      })
    )
    .required(),
});

export const assertInputCommande = async (
  data: unknown
): Promise<CommandeInput> => {
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
