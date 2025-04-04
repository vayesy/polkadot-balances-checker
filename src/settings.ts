/**
 * Minimum amount of the currency, below which it will be marked as alerting.
 */
export const DEFAULT_THRESHOLD = parseFloat(
  process.env.DEFAULT_THRESHOLD || "10",
);

/**
 * Frequency of how often alert notification should be sent, specified in seconds.
 */
export const DEFAULT_NOTIFICATION_FREQUENCY = parseInt(
  process.env.DEFAULT_NOTIFICATION_FREQUENCY || "3600",
);

/**
 * Specify notification type to send when account state changes
 */
export const NOTIFICATION_TYPE = process.env.NOTIFICATION_TYPE || "console";

/**
 * Specify node URL to access the chain to retrieve balances
 */
export const CHAIN_URL =
  process.env.CHAIN_URL || "wss://polkadot-rpc.publicnode.com/";

/**
 * Logging level to use for app. All log messages below this would be ignored.
 */
export const LOGGING_LEVEL = process.env.LOGGING_LEVEL || "info";

/**
 * Below are database (Postgres) configurations
 */
export const DB_HOST = process.env.DB_HOST || "localhost";
export const DB_PORT = parseInt(process.env.DB_PORT || "5432");
export const DB_USER = process.env.DB_USER || "balances-checker";
export const DB_PASSWORD = process.env.DB_PASSWORD;
export const DB_NAME = process.env.DB_NAME || "balances-checker";
