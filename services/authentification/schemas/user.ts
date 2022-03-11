import { vs, Status } from "../deps.ts";

const inputSchema = {
	nom: vs.string(),
	mail: vs.email(),
	mdp: vs.string(),
};

export const assertInputUser = (data: unknown) => {
	return vs.applySchemaObject(inputSchema, data, (err) => {
		const key = err.keyStack.shift();
		throw {
			status: Status.BadRequest,
			message: `${key} (${err.value}) is invalid: ${err.cause}`,
		};
	});
};
