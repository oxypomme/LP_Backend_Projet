import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import { getOneOrderItems } from "../data/items";

const router = Router();

router.get("/", async (req, res) => {
  try {
    res.sendPayload(await getOneOrderItems(req.previous.params.id), "items");
  } catch (error) {
    res.sendError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Une erreur est survenue : " + (error as Error).message
    );
  }
});

export default router;
