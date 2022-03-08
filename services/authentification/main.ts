import { Application } from "./deps.ts";
import { errorHandler } from "./middlewares/api.ts";
import Router from "./routes/index.ts";

const app = new Application();

// Logger
app.use(async (ctx, next) => {
	await next();
	const rt = ctx.response.headers.get("X-Response-Time");
	const status = ctx.response.status;
	console.log(`${ctx.request.method} ${ctx.request.url} - ${rt} ${status}`);
});

// Timing
app.use(async (ctx, next) => {
	const start = Date.now();
	await next();
	const ms = Date.now() - start;
	ctx.response.headers.set("X-Response-Time", `${ms}ms`);
});

// Error format
app.use(errorHandler);

app.use(Router.routes());
app.use(Router.allowedMethods());

await app.listen({ port: 3000 });
