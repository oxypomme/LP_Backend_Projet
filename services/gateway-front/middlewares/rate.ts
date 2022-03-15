import RateLimiter from "async-ratelimiter";
import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import Redis from "ioredis";
import { getClientIp } from "request-ip";

const rateLimiter = new RateLimiter({
	db: new Redis(undefined, "lbs_redis"),
});

const handler: RequestHandler = async (req, res, next) => {
	const clientIp = getClientIp(req);
	const limit = await rateLimiter.get({ id: clientIp ?? undefined });

	if (!res.writableEnded && !res.headersSent) {
		res.setHeader("X-Rate-Limit-Limit", limit.total);
		res.setHeader("X-Rate-Limit-Remaining", Math.max(0, limit.remaining - 1));
		res.setHeader("X-Rate-Limit-Reset", limit.reset);
	}

	if (!limit.remaining) {
		res.sendError(
			StatusCodes.TOO_MANY_REQUESTS,
			`API rate limit exceeded for ${clientIp}`
		);
	} else {
		next();
	}
};

export default handler;
