// import { AccountId } from '@polkadot/types/interfaces/runtime'
import { HexString } from "@polkadot/util/types";

/**
 * Records from configuration YML file are expected to be provided in this format
 */
export type ObservableAccountConfig = {
  /**
   * Account id in the respective chain
   */
  accountId: string;

  /**
   * Publicly visible name or tag for the given account
   */
  alias: string;

  /**
   * Threshold for balance amount to consider account as low balance
   */
  threshold?: number;

  /**
   * How often (in seconds) notification about given account should be sent
   */
  notificationFrequency?: number;
};

export enum NotificationStatus {
  /**
   * Account is approaching to low balance amount
   */
  approaching,

  /**
   * Account has less then allowed threshold of balance
   */
  lowBalance,

  /**
   * Account balance is back to normal after it was approaching to low or was actually low balance
   */
  resolved,
}

export type ObservableAccountState = {
  accountId: string;
  accountIdHex: HexString;
  alias: string;
  threshold: number;
  notificationFrequency: number;
  previousStatus?: NotificationStatus;
};

export type Notification = {
  account: ObservableAccountState;
  status: NotificationStatus;
  actualBalance: number;
  threshold: number;
};

export type AccountsMap = Map<HexString, ObservableAccountState>;
