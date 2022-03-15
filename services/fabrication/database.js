"use strict";

import knex from "knex";
import { env } from "process";

const db = knex({
  client: "mysql",
  connection: {
    host: env?.MARIADB_HOST,
    port: env?.MARIADB_PORT ? +env.MARIADB_PORT : undefined,
    user: env?.MARIADB_USER,
    password: env?.MARIADB_PASSWORD,
    database: env?.MARIADB_DATABASE,
  },
});

export default db;
