"use strict";

import express from "express";
import logger from "morgan";
import { StatusCodes } from "http-status-codes";
import helmet from "helmet";

import apiMiddleware from "./middlewares/api.js";
import rateMiddleware from "./middlewares/rate.js";

import router from "./routes/index.js";

const app = express();

app.use(logger("dev"));

app.use(helmet());
app.use(apiMiddleware);
app.use(rateMiddleware);

app.use(router);

app.get("*", (req, res) => {
  res.sendError(StatusCodes.NOT_FOUND, "Cette adresse n'existe pas");
});

export default app;
