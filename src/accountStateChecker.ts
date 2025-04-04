import { NotificationStatus } from "./types";
import logger from "./logger";
import { AccountReposirory } from "./db";

/**
 * This class is responsible for determining is account state changed and if notification should be created for given account.
 * It also keeps track of previous account status.
 */
export class AccountStateChecker {
  private accountRepository: AccountReposirory;
  private statuses: Map<string, NotificationStatus>;

  public constructor(repository: AccountReposirory) {
    this.accountRepository = repository;
    this.statuses = new Map();
  }

  /**
   * Load recent account statuses from database in order for app to have consistent state between restarts
   * @param addresses list of addresses to fetch statuses for
   */
  public async loadAccountStatuses(addresses: string[]) {
    const records = await this.accountRepository.getAccounts(addresses);
    records.forEach((record) => {
      this.statuses.set(record.account, record.status);
    });
    if (this.statuses.size) {
      logger.debug(`Loaded ${this.statuses.size} records from database`);
    } else {
      logger.debug("No records loaded from database");
    }
  }

  /**
   *
   * @param address Helper method to get status for specific account
   * @returns Notification status If account exist, otherwise undefined
   */
  public getAccountStatus(address: string): NotificationStatus | undefined {
    return this.statuses.get(address);
  }

  /**
   * Checks if account state changed based on previous status and current one
   * @param address account address
   * @param newStatus new status of the account based on recent updates
   * @returns true if status changes, false otherwise
   */
  public isAccountStateChanged(
    address: string,
    newStatus: NotificationStatus,
  ): boolean {
    const previousStatus =
      this.statuses.get(address) ?? NotificationStatus.resolved;
    return newStatus !== previousStatus;
  }
}
