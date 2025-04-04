import { db } from "./database";
import { NewNotification } from "./databaseTypes";

export class NotificationReposirory {
  tableName = "notification" as const;

  public async insertNotification(record: NewNotification) {
    return await db
      .insertInto(this.tableName)
      .values(record)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  public async getNotificationsForAccounts(addresses: string[]) {
    return await db
      .selectFrom(this.tableName)
      .select("account")
      .select("createdAt")
      .where("account", "in", addresses)
      .orderBy("account")
      .orderBy("createdAt desc")
      .distinctOn("account")
      .execute();
  }
}
