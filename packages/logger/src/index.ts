import {
  createLogger,
  transports,
  format,
  Logger as winstonLogger,
} from "winston";
import util from "util";
const { combine, timestamp, printf, colorize } = format;

class loggerConfig {
  private customeLoggerFormat: any;
  private enumnerateErrorFormat: any;
  private folder: string;
  constructor(folder: string) {
    this.folder = folder;
    this.customeLoggerFormat = printf((info: any): string => {
      let message: string;
      if (info.message instanceof Object || info instanceof Object) {
        message = util.inspect(info.message, {
          compact: true,
          depth: Infinity,
        });
        message = info.stack ? ` ${message} \n ${info.stack}` : message;
      } else {
        message = info.stack
          ? `${info.message} \n ${info.stack}`
          : info.message;
      }
      return `${info.timestamp} [${info.level}] ${message}`;
    });

    this.enumnerateErrorFormat = format((info) => {
      if (info instanceof Error) {
        Object.assign(info, { message: info.message, stack: info.stack });
      }
      return info;
    });
  }

  devlepmentConfig(): winstonLogger {
    return createLogger({
      level: "silly",
      format: combine(
        this.enumnerateErrorFormat(),
        colorize(),
        timestamp(),
        this.customeLoggerFormat,
      ),
      transports: [new transports.Console()],
    });
  }

  productionConfig(): winstonLogger {
    return createLogger({
      level: "info",
      format: combine(
        this.enumnerateErrorFormat(),
        timestamp(),
        this.customeLoggerFormat,
      ),
      transports: [
        new transports.Console({ level: "info" }),
        new transports.File({
          filename: `logs/error.log`,
          level: "error",
        }),
        new transports.File({
          filename: "logs/info.log",
          level: "info",
        }),
        new transports.File({
          filename: "logs/combine.log",
          level: "debug",
        }),
      ],
    });
  }
}

export { loggerConfig, winstonLogger };
