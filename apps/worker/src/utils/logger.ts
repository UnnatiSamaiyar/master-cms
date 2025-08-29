import { loggerConfig, winstonLogger as Logger } from "@repo/logger";

let winstonLoggerConfig = new loggerConfig("");

let logger: Logger;

process.env.NODE_ENV !== "production"
  ? (logger = winstonLoggerConfig.devlepmentConfig())
  : (logger = winstonLoggerConfig.productionConfig());

export default logger;
