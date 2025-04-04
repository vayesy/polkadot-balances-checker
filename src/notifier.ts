// import axios, { AxiosInstance } from "axios";
import { Notification, NotificationStatus } from "./types";
import logger from "./logger";
import { NotificationReposirory } from "./db";

/**
 * Perform notification for account balance falling below minimum amount
 */
export abstract class Notifier {
  repository: NotificationReposirory;

  constructor(repository: NotificationReposirory) {
    this.repository = repository;
  }

  abstract execute(notification: Notification): Promise<boolean>;

  public async notify(notification: Notification) {
    this.execute(notification);
    await this.repository.insertNotification({
      status: notification.status,
      account: notification.account.accountIdHex,
      createdAt: new Date(),
    });
    logger.debug("Notification sent");
  }

  public constructMessage(notification: Notification): string {
    const { status, account, actualBalance: balance, threshold } = notification;
    const { alias: accountName } = account;
    const balanceHuman = balance.toFixed(3);

    switch (status) {
      case NotificationStatus.approaching:
        return `Account ${accountName} balance ${balanceHuman} is approaching to low value ${threshold}`;
      case NotificationStatus.lowBalance:
        return `Account ${accountName} balance having low value ${balanceHuman}, threshold of ${threshold}`;
      case NotificationStatus.resolved:
        return `Account ${accountName} balance ${balanceHuman} is back to normal`;
      default:
        return `Unknown type of notification ${status}`;
    }
  }
}

/**
 * Just outputs message to console
 */
export class ConsoleNotifier extends Notifier {
  public async execute(notification: Notification) {
    logger.info(`Console notification: ${this.constructMessage(notification)}`);
    return true;
  }
}

// /**
//  * Notification, which is sent via email
//  */
// export class EmailNotifier extends Notifier {
//   private client: AxiosInstance;

//   constructor(registry: NotificationReposirory) {
//     super(registry);
//     this.client = axios.create();
//   }

//   async execute(notification: Notification) {
//     // todo: implement me
//     return true;
//   }
// }
