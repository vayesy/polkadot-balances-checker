import winston from "winston";
import { LOGGING_LEVEL } from "./settings";

const logger = winston.createLogger({
  level: LOGGING_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level}: ${message}`;
    }),
  ),
  defaultMeta: { service: "balances-checker" },
  transports: [new winston.transports.Console()],
});

export default logger;
