import logger from "./logger";
import { Application } from "./application";
import { ensureSchema } from "./db/utils";

/**
 * Application entry point.
 * While running the application it is possible to provide configuration file path via argument.
 */
async function run() {
  try {
    await ensureSchema();
  } catch (error) {
    logger.error(error);
    return;
  }
  const configFile =
    process.argv.length > 2 ? process.argv[2] : "default-accounts.yml";
  const app = new Application();
  process.on("SIGTERM", app.stop);
  process.on("SIGINT", app.stop);
  await app.run(configFile);
}

run().catch(logger.error);