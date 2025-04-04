import { sql } from "kysely";
import { db } from "./database";

export const ensureSchema = async () => {
  const dbNow = sql`timezone('utc', now())`;

  const tables = new Set(
    (await db.introspection.getTables()).map((table) => table.name),
  );

  if (!tables.has("accountStatus")) {
    await db.schema
      .createTable("accountStatus")
      .addColumn("account", "varchar(100)", (cb) => cb.unique().notNull())
      .addColumn("status", "smallint", (cb) => cb.notNull())
      .addColumn("createdAt", "timestamp", (cb) =>
        cb.notNull().defaultTo(dbNow),
      )
      .addColumn("updatedAt", "timestamp", (cb) =>
        cb.notNull().defaultTo(dbNow),
      )
      .execute();
  }

  if (!tables.has("notification")) {
    await db.schema
      .createTable("notification")
      .addColumn("account", "varchar(100)", (cb) => cb.notNull())
      .addColumn("status", "smallint", (cb) => cb.notNull())
      .addColumn("createdAt", "timestamp", (cb) =>
        cb.notNull().defaultTo(dbNow),
      )
      .execute();
  }
};
