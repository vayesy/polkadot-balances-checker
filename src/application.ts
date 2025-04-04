import { HexString } from "@polkadot/util/types";
import {
  AccountsMap,
  Notification,
  NotificationStatus,
  ObservableAccountState,
} from "./types";
import logger from "./logger";
import ConfigLoader from "./configLoader";
import { ChainObserver } from "./chainObserver";
import { Notifier, ConsoleNotifier } from "./notifier";
import { AccountStateChecker } from "./accountStateChecker";
import { AccountReposirory, NotificationReposirory } from "./db";
import { PeriodicNotifier } from "./periodicNotifier";

export class Application {
  private accounts!: AccountsMap;
  private observer!: ChainObserver;
  private notifier!: Notifier;
  private perioidcNotifier!: PeriodicNotifier;
  private stateChecker!: AccountStateChecker;
  private accountRepository!: AccountReposirory;

  public constructor() {
    this.accountRepository = new AccountReposirory();
  }

  private initializeAccounts(configFile: string): boolean {
    let accounts;
    try {
      accounts = new ConfigLoader().load(configFile);
    } catch (ex) {
      logger.error(
        "Error while loading accounts configuration file. " +
          "Please make sure file exists and accounts specified in proper format",
        {error: ex},
      );
      return false;
    }
    this.accounts = accounts.reduce(
      (all, item) => all.set(item.accountId, item),
      new Map(),
    );
    return true;
  }

  private initializeObserver() {
    this.observer = new ChainObserver(
      Array.from(this.accounts.keys()),
      this.checkAccounts.bind(this),
    );
  }

  private getAccountAddresses() {
    const addresses: string[] = new Array(this.accounts.size);
    this.accounts.forEach((v) => {
      addresses.push(v.accountIdHex);
    });
    return addresses;
  }

  private checkAccount(account: ObservableAccountState, balance: number) {
    const threshold = account?.threshold ?? 0;
    const thresholdForWarning = threshold * 1.1;
    let newAccountStatus: NotificationStatus;
    if (balance <= threshold) {
      newAccountStatus = NotificationStatus.lowBalance;
    } else if (balance <= thresholdForWarning) {
      newAccountStatus = NotificationStatus.approaching;
    } else {
      newAccountStatus = NotificationStatus.resolved;
    }
    const recordExists =
      this.stateChecker.getAccountStatus(account.accountIdHex) !== undefined;
    if (recordExists) {
      this.accountRepository.updateAccount(account.accountIdHex, {
        status: newAccountStatus,
        updatedAt: new Date().toUTCString(),
      });
    } else {
      this.accountRepository.insertAccount({
        account: account.accountIdHex,
        status: newAccountStatus,
      });
    }
    if (
      !this.stateChecker.isAccountStateChanged(
        account.accountIdHex,
        newAccountStatus,
      )
    ) {
      logger.debug(`Account ${account.alias} has no changes`);
    } else {
      const notification: Notification = {
        account,
        threshold,
        status: newAccountStatus,
        actualBalance: balance,
      };
      this.notifier.notify(notification);
    }
    account.previousStatus = newAccountStatus;
    if (newAccountStatus === NotificationStatus.lowBalance) {
      this.perioidcNotifier.addAccount(account, balance);
    } else {
      this.perioidcNotifier.removeAccount(account);
    }
  }

  private checkAccounts(balances: Map<HexString, number>) {
    for (const [accountId, balance] of balances) {
      const observableAccount = this.accounts.get(accountId);
      if (observableAccount === undefined) {
        logger.error(`Not found account for id ${accountId.toString()}`);
        continue;
      }
      this.checkAccount(observableAccount, balance);
    }
  }

  public async run(configFile: string) {
    if (!this.initializeAccounts(configFile)) {
      logger.error("No accounts were read, application stops");
      process.exit(1);
    }
    const notificationReposirory = new NotificationReposirory();
    this.stateChecker = new AccountStateChecker(this.accountRepository);
    this.notifier = new ConsoleNotifier(notificationReposirory);
    this.perioidcNotifier = new PeriodicNotifier(this.notifier);
    await this.perioidcNotifier.syncLastNotificationTimes(
      Array.from(this.accounts.values()),
      notificationReposirory,
    );
    await this.stateChecker.loadAccountStatuses(this.getAccountAddresses());
    logger.info(`Starting application with ${this.accounts.size} accounts`);
    this.initializeObserver();
    await this.observer.start();
  }

  public stop() {
    logger.info("Stoppping");
    this.observer.stop();
    this.perioidcNotifier.stop();
  }
}
