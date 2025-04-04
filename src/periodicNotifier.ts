import { NotificationStatus, ObservableAccountState } from "./types";
import logger from "./logger";
import { NotificationReposirory } from "./db";
import { Notifier } from "./notifier";

type ProcessingItem = {
  nextRunAt: number;
  balance: number;
  account: ObservableAccountState;
};

/**
 * Responsible for periodic notification for unhealthy accounts
 */
export class PeriodicNotifier {
  accounts: Map<string, ProcessingItem>;
  lastNotifications: Map<string, number>;
  notifier: Notifier;
  intervalId?: ReturnType<typeof setInterval>;

  public constructor(notifier: Notifier) {
    this.accounts = new Map();
    this.lastNotifications = new Map();
    this.notifier = notifier;
  }

  /**
   * Single iteration of the app.
   * Checks tracked accounts and generates notifications as needed.
   */
  private iteration() {
    const now = Date.now();
    for (const item of this.accounts.values()) {
      if (item.nextRunAt > now) {
        continue;
      }
      const { account, balance } = item;
      logger.info(
        `Sending repeated notification for the account ${account.alias}`,
      );
      this.notifier.notify({
        account,
        threshold: account.threshold,
        status: account.previousStatus ?? NotificationStatus.resolved,
        actualBalance: balance,
      });
      item.nextRunAt = Date.now() + account.notificationFrequency * 1000
    }
  }

  /**
   * Helper method to check if there is active interval running the iterations
   */
  private get isRunning() {
    return this.intervalId !== undefined;
  }

  /**
   * Helper method to get account identifier
   */
  private getKey(account: ObservableAccountState): string {
    return account.accountId;
  }

  /**
   * Adds account to tracking and periodical notification sending.
   * If iterations were paused, they will continue as long as account is added.
   *
   * @param account - account to track
   * @param balance - balance value of the given account
   */
  public addAccount(account: ObservableAccountState, balance: number) {
    const acocuntKey = this.getKey(account);
    if (!this.accounts.has(acocuntKey)) {
      const lastNotificationTime =
        this.lastNotifications.get(acocuntKey) ?? Date.now();
      this.lastNotifications.delete(acocuntKey);
      this.accounts.set(account.accountId, {
        nextRunAt: lastNotificationTime + account.notificationFrequency * 1000,
        account,
        balance,
      });
    } else {
      this.resetTimerForAccount(account, balance);
    }
    if (!this.isRunning) {
      this.start();
    }
  }

  /**
   * Removes accoount from periodical check and notification sending.
   * If not accounts left in the tracking collection, further iteration stops until there will be any more accounts to track.
   *
   * @param account account to be removed from tracking
   */
  public removeAccount(account: ObservableAccountState) {
    this.accounts.delete(this.getKey(account));
    if (!this.accounts.size && this.isRunning) {
      this.stop();
    }
  }

  /**
   * Helper method to reset next notification time for the account.
   */
  public resetTimerForAccount(
    account: ObservableAccountState,
    newBalance?: number,
  ) {
    const item = this.accounts.get(this.getKey(account));
    if (item !== undefined) {
      item.nextRunAt = Date.now() + account.notificationFrequency * 1000;
      if (newBalance !== undefined) {
        item.balance = newBalance;
      }
    }
  }

  /**
   * Syncs last notification times from database to persist state between app runs
   */
  public async syncLastNotificationTimes(
    trackedAccounts: ObservableAccountState[],
    notificationReposirory: NotificationReposirory,
  ) {
    try {
      const lastNotifications =
        await notificationReposirory.getNotificationsForAccounts(
          trackedAccounts.map(this.getKey),
        );
      lastNotifications.forEach((notification) => {
        const { account, createdAt } = notification;
        this.lastNotifications.set(account, createdAt.getTime());
      });
    } catch (err) {
      logger.error(err);
    }
  }

  /**
   * Starts interval with iterations
   */
  private start() {
    if (this.accounts.size && !this.isRunning) {
      this.intervalId = setInterval(this.iteration.bind(this), 5000);
    }
  }

  /**
   * Stops interval with iterations
   */
  public stop() {
    if (this.isRunning) {
      clearInterval(this.intervalId);
    }
  }
}
