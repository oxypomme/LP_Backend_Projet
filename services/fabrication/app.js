import express from "express";
import logger from "morgan";
import { StatusCodes } from "http-status-codes";

import apiMiddleware from "./middlewares/api.js";
import commandesRouter from "./routes/commandes.js";

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(apiMiddleware);

app.use("/commandes", commandesRouter);

app.get("*", (req, res) => {
  res.sendError(StatusCodes.NOT_FOUND, "Cette adresse n'existe pas");
});

app.use("*", (req, res) => {
  res.sendError(
    StatusCodes.METHOD_NOT_ALLOWED,
    "Cette méthode n'est pas autorisée"
  );
});

export default app;
