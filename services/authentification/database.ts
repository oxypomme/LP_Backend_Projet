import { denodb } from "./deps.ts";

const port = Deno.env.get("MARIADB_PORT");

const db = new denodb.Database(
	new denodb.MySQLConnector({
		host: Deno.env.get("MARIADB_HOST") ?? "localhost",
		port: port ? +port : undefined,
		username: Deno.env.get("MARIADB_USER") ?? "root",
		password: Deno.env.get("MARIADB_PASSWORD") ?? "root",
		database: Deno.env.get("MARIADB_DATABASE") ?? "",
	})
);

export default db;
