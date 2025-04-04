import { db } from "./database";
import { NewAccountStatus, AccountStatusUpdate } from "./databaseTypes";

export class AccountReposirory {
  tableName = "accountStatus" as const;

  public async getAccount(address: string) {
    return await db
      .selectFrom(this.tableName)
      .where("account", "=", address)
      .selectAll()
      .executeTakeFirst();
  }

  public async getAccounts(addresses: string[]) {
    return await db
      .selectFrom(this.tableName)
      .where("account", "in", addresses)
      .selectAll()
      .execute();
  }

  public async insertAccount(record: NewAccountStatus) {
    return await db
      .insertInto(this.tableName)
      .values(record)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  public async updateAccount(address: string, updateWith: AccountStatusUpdate) {
    return await db
      .updateTable(this.tableName)
      .set(updateWith)
      .where("account", "=", address)
      .execute();
  }
}
