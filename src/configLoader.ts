import fs from "fs";
import YAML from "yaml";

import { DEFAULT_THRESHOLD, DEFAULT_NOTIFICATION_FREQUENCY } from "./settings";
import { ObservableAccountConfig, ObservableAccountState } from "./types";
import { accountIdToHex } from "./utils";

/**
 * Responsible for reading YML files, containing list of accounts to track balances for.
 */
export default class ConfigLoader {
  /**
   * Converts parsed yml content into app specific format.
   * Also validates for all the parameters to be present in place, adding default values where needed.
   * @param content parsed content, previously read from configuration YML file
   * @returns
   */
  private convert(
    content: ReturnType<typeof YAML.parse>,
  ): Array<ObservableAccountState> {
    if (!Array.isArray(content)) {
      throw TypeError(
        "Configuration file should contain list of account records",
      );
    }
    return content.map((item) => {
      const value = <ObservableAccountConfig>item;
      return this.convertToState(value);
    });
  }

  /**
   * Reads content from yml configuration file and forwards it to the post processing
   * @param filePath location of the file with configurations
   */
  private loadFromFile(filePath: string): ReturnType<typeof YAML.parse> {
    const file = fs.readFileSync(filePath, "utf8");
    return YAML.parse(file);
  }

  /**
   * Convert list item from yml file into appropriate structure to be used by application.
   * Check if there are any missing values, which can be replaced by default ones.
   * @param item item from the list in config file
   */
  private convertToState(
    item: ObservableAccountConfig,
  ): ObservableAccountState {
    const {
      accountId,
      alias,
      threshold = DEFAULT_THRESHOLD,
      notificationFrequency = DEFAULT_NOTIFICATION_FREQUENCY,
    } = item;
    return {
      accountId,
      accountIdHex: accountIdToHex(accountId),
      alias,
      threshold,
      notificationFrequency,
    };
  }

  /**
   * Only public method, which should be used to read configuration file.
   *
   * @throws {@link TypeError}
   * Happens in case YML file contains data in invalid format
   *
   * @throws {@link Error}
   * Happens in case file configuration file does not exist or data is in invalid format
   *
   * @returns list of account objects to be tracked.
   */
  public load(configPath: string): Array<ObservableAccountState> {
    const content = this.loadFromFile(configPath);
    const accounts = this.convert(content);
    return accounts;
  }
}
