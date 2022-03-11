import db from "../database.ts";
import { compare, hash, denodb } from "../deps.ts";
import { assertInputUser } from "../schemas/user.ts";

class User extends denodb.Model {
	static table = "client";
	static timestamps = true;
	static fields = {
		id: {
			primaryKey: true,
			autoIncrement: true,
		},
		nom_client: denodb.DataTypes.STRING,
		mail_client: denodb.DataTypes.STRING,
		passwd: denodb.DataTypes.STRING,
		cumul_achats: denodb.DataTypes.DECIMAL,
	};
}
db.link([User]);

export const findUser = async (login: string, password: string) => {
	const u = await User.where({
		mail_client: login,
	}).first();

	if (await compare(password, u.passwd?.toString() ?? "")) {
		return u;
	}
	return undefined;
};

export const createUser = async (data: unknown) => {
	const { nom, mail, mdp } = assertInputUser(data);
	const u = {
		nom_client: nom,
		mail_client: mail,
		cumul_achats: 0,
		createdAt: new Date(),
	};
	const { lastInsertId } = await User.create({
		...u,
		passwd: await hash(mdp),
	});

	return { id: lastInsertId, ...u };
};
