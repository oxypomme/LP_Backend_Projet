import { createUser } from "../data/users.ts";
import { Router, Status } from "../deps.ts";
import {
	createJWT,
	refreshJWT,
	default as authMiddlware,
} from "../middlewares/jwt.ts";

const router = new Router();
router
	.get("/check", authMiddlware, (ctx) => {
		ctx.response.body = {
			content: ctx.state.jwt,
		};
	})
	.get("/refresh", authMiddlware, refreshJWT)
	.post("/signin", createJWT)
	.post("/signup", async (ctx) => {
		const body = ctx.request.body();
		if (body.type === "json") {
			const user = await createUser(await body.value);
			ctx.response.body = user;
		} else {
			ctx.throw(Status.BadRequest, "Wrong body format");
		}
	});

export default router;
