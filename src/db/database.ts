import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";
import { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } from "../settings";
import { Database } from "./databaseTypes";

const dialect = new PostgresDialect({
  pool: new Pool({
    database: DB_NAME,
    host: DB_HOST,
    user: DB_USER,
    port: DB_PORT,
    password: DB_PASSWORD,
    max: 10,
  }),
});

export const db = new Kysely<Database>({
  dialect,
});
