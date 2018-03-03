import { createLogger, transports, format } from 'winston';
import 'winston-daily-rotate-file';

const env = process.env.NODE_ENV || 'development';

const { printf, combine, timestamp } = format;
const myFormat = printf(info => `${info.timestamp} - ${info.level}: ${info.message}`);
const dateFmt = () => new Date().toLocaleTimeString();

// Setup Winston@3.0 for logging
const logger = createLogger({
  level: 'info', // this is the MAXIMUM level that should be transported
  // format: winston.format.json(),
  format: combine(timestamp(), myFormat),
  transports: [
    // - Write all logs error (and below) to `error.log`.
    new transports.DailyRotateFile({
      filename: 'logs/%DATE%-error.log',
      timestamp: dateFmt(),
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      prepend: true
    }),
    // - Write to all logs with level `info` and below to `combined.log`
    new transports.DailyRotateFile({
      filename: 'logs/%DATE%-combined.log',
      timestamp: dateFmt(),
      datePattern: 'YYYY-MM-DD',
      prepend: true,
      level: env === 'development' ? 'verbose' : 'info'
    })
  ]
});

// If we're not in production then log to the `console` with the format:
if (env !== 'production') {
  logger.add(
    new transports.Console({
      format: combine(timestamp(), myFormat),
      timestamp: dateFmt(),
      colorize: true
    })
  );
}

export default logger;
