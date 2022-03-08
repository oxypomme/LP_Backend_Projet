import { Middleware, isHttpError, Status } from "../deps.ts";

type CustomError = {
	status: Status;
	cause: string;
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
		let err = {
			status: Status.InternalServerError,
			cause: "Unexpected Error",
			message: error instanceof Error ? error.message : error,
		};
		if (isHttpError(error)) {
			err = error as CustomError;
		} else {
			console.error("Error :", err.message);
		}

		ctx.response.status = err.status;
		ctx.response.body = buildError(err);
	}
};
