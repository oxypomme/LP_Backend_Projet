import express from "express";
import helmet from "helmet";
import { StatusCodes } from "http-status-codes";
import logger from "morgan";
import apiMiddleware from "./middlewares/api";
import rateMiddleware from "./middlewares/rate";
import router from "./routes";

const app = express();

app.use(logger("dev"));
app.use(express.json());

app.use(helmet());
app.use(apiMiddleware);
app.use(rateMiddleware);

app.use(router);

app.get("*", (req, res) => {
	res.sendError(StatusCodes.NOT_FOUND, "Cette adresse n'existe pas");
});

app.use("*", (req, res) => {
	res.sendError(
		StatusCodes.METHOD_NOT_ALLOWED,
		"Cette méthode n'est pas autorisée"
	);
});

export = app;
