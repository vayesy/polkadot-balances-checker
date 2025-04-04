import {
  Insertable,
  Selectable,
  Updateable,
  Generated,
  ColumnType,
} from "kysely";
import { NotificationStatus } from "../types";

export interface Database {
  accountStatus: AccountStatusTable;
  notification: NotificationTable;
}

export interface AccountStatusTable {
  account: string;
  status: NotificationStatus;
  createdAt: Generated<Date>;
  updatedAt: ColumnType<
    Generated<Date>,
    string | undefined,
    string | undefined
  >;
}

export interface NotificationTable {
  account: string;
  status: NotificationStatus;
  createdAt: Generated<Date>;
}

export type AccountStatus = Selectable<AccountStatusTable>;
export type NewAccountStatus = Insertable<AccountStatusTable>;
export type AccountStatusUpdate = Updateable<AccountStatusTable>;

export type Notification = Selectable<NotificationTable>;
export type NewNotification = Insertable<NotificationTable>;
