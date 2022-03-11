import { Middleware, isHttpError, Status } from "../deps.ts";

type CustomError = {
	status: Status;
	message: string;
};

export const buildError = (error: CustomError) => ({
	type: "error",
	error: {
		code: error.status,
		reason: Status[error.status],
	},
	message: error.message,
});

export const errorHandler: Middleware = async (ctx, next) => {
	try {
		await next();
	} catch (error) {
		const err = {
			status: error.status || Status.InternalServerError,
			message: error.message || error,
		};

		if (!isHttpError(error)) {
			console.error("Error :", err.message);
		}

		ctx.response.status = err.status;
		ctx.response.body = buildError(err);
	}
};
