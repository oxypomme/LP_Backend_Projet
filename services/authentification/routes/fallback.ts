import { Router, Status } from "../deps.ts";

const router = new Router();
router
	.get("/(.*)", (ctx) => {
		ctx.throw(Status.NotFound, "Cette adresse n'existe pas");
	})
	.all("/(.*)", (ctx) => {
		ctx.throw(Status.MethodNotAllowed, "Cette méthode n'est pas autorisée");
	});

export default router;
