import { createUser } from "../data/users.ts";
import { Router } from "../deps.ts";
import { createJWT } from "../middlewares/jwt.ts";

const router = new Router();
router.post("/signin", createJWT).post("/signout", async (ctx) => {
	const payload = await ctx.request.body({ type: "json" }).value;
	const user = await createUser(payload);
	ctx.response.body = user;
});

export default router;
