import { findUser } from "../data/users.ts";
import { jwt, Middleware, b64, Status } from "../deps.ts";

const JWT_KEY = await crypto.subtle.generateKey(
	{ name: "HMAC", hash: "SHA-512" },
	true,
	["sign", "verify"]
);

const genJWT = async () => {
	const exp = jwt.getNumericDate(60 * 60);
	return {
		exp,
		token: await jwt.create(
			{ alg: "HS512", typ: "JWT" },
			{
				exp: exp,
				iat: jwt.getNumericDate(new Date()),
			},
			JWT_KEY
		),
	};
};

export const refreshJWT: Middleware = async (ctx) => {
	ctx.response.body = await genJWT();
};

export const createJWT: Middleware = async (ctx) => {
	try {
		const header = ctx.request.headers.get("authorization");
		if (!header) {
			throw "Missing credential";
		}

		const auth = header.split(" ");
		if (auth.length <= 1) {
			throw "Missing credential";
		}

		// Getting login and password from headers
		const [login, password] = new TextDecoder()
			.decode(b64.decode(auth[1]))
			.split(":");

		const user = await findUser(login, password);
		if (!user) {
			throw "Bad credentials";
		}

		ctx.response.body = await genJWT();
	} catch (error) {
		ctx.throw(Status.Unauthorized, error);
	}
};

const handler: Middleware = async (ctx, next) => {
	try {
		const header = ctx.request.headers.get("authorization");
		if (!header) {
			throw "Missing credential";
		}

		const auth = header.split(" ");
		if (auth.length <= 1) {
			throw "Missing credential";
		}

		const payload = await jwt.verify(auth[1], JWT_KEY);

		ctx.state.jwt = payload;
		await next();
		delete ctx.state.jwt;
	} catch (error) {
		ctx.throw(
			Status.Unauthorized,
			error instanceof Error ? error.message : error
		);
	}
};

export default handler;
