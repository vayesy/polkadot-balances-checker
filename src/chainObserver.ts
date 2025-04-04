import { ApiPromise, WsProvider } from "@polkadot/api";
import { Codec } from "@polkadot/types/types";
import { HexString } from "@polkadot/util/types";
import { CHAIN_URL } from "./settings";
import logger from "./logger";

type CallbackType = (balances: Map<HexString, number>) => void;

/**
 * Intended to track balance updates for provided accounts by
 * connecting to chain node and subscribing for balance change events
 */
export class ChainObserver {
  private accounts: HexString[];
  private api!: ApiPromise;
  private unsubscribe!: () => void;
  private onBalanceUpdate: CallbackType;
  private chainDecimals!: number;

  public constructor(accounts: HexString[], onUpdate: CallbackType) {
    this.accounts = accounts;
    this.onBalanceUpdate = onUpdate;
  }

  /**
   * Connects to chain node and retrieves necessary parameters, such as decimal places
   * @returns true if connection established and data fetched, false otherwise
   */
  private async initializeConnection(): Promise<boolean> {
    try {
      const wsProvider = new WsProvider(CHAIN_URL);
      const api = await ApiPromise.create({ provider: wsProvider });
      this.api = api;
      const chain = await api.rpc.system.chain();
      const chainInfo = await api.registry.getChainProperties();
      this.chainDecimals = chainInfo?.tokenDecimals.unwrap()[0].toNumber() || 0;
      logger.info(
        `Connected to the chain ${chain}, ${this.chainDecimals} decimals`,
      );
    } catch {
      logger.error("Failed to establish connection with the chain");
      return false;
    }
    return true;
  }

  /**
   * Initiates subscription to chec chain accounts by sending corresponding command to node.
   * Note: connection should be established prior to calling this method.
   */
  private async subscribeForBalanceUpdates() {
    this.unsubscribe = await this.api.query.system.account.multi(
      this.accounts,
      (balances) => {
        const balancesMap = this.preprocessRecords(balances);
        this.onBalanceUpdate(balancesMap);
      },
    );
  }

  /**
   * Connect to node and subscribe for updates
   */
  public async start() {
    await this.initializeConnection();
    await this.subscribeForBalanceUpdates();
  }

  /**
   * Clean up resources by stopping subscription if there is one
   */
  public stop() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  /**
   * Helper method to convert chain specific data types into application format
   * @param balances records fetched from the chain, containing accounts information
   */
  private preprocessRecords(balances: Codec[]): Map<HexString, number> {
    const balancesMap = new Map<HexString, number>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    balances.map((balance: any, i) => {
      balancesMap.set(
        this.accounts[i],
        balance.data.free.toNumber() / 10 ** this.chainDecimals,
      );
    });
    return balancesMap;
  }
}
