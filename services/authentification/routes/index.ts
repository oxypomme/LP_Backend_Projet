import { createUser } from "../data/users.ts";
import { Router } from "../deps.ts";
import { createJWT, default as authJWT } from "../middlewares/jwt.ts";

const router = new Router();
router
	.post("/auth", createJWT)
	.post("/register", async (ctx) => {
		const payload = await ctx.request.body({ type: "json" }).value;
		const user = await createUser(payload);
		ctx.response.body = user;
	})
	.get("/", authJWT, (ctx) => {
		ctx.response.body = { ...ctx.state.jwt };
	});

export default router;
