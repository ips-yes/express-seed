// ------------------------------------------- //
// Setup logger                                //
// ------------------------------------------- //
import winston from 'winston';

const logLevels = {
  levels: {
    fatal: 0,
    error: 1,
    warn: 2,
    verbose: 3,
    debug: 4,
    info: 5,
  },
  colors: {
    debug: 'cyan',
    verbose: 'white',
    info: 'green',
    warn: 'yellow',
    error: 'red',
    fatal: 'red',
  },
};

const logger = winston.createLogger({
  levels: logLevels.levels,
  transports:
[
  new (winston.transports.Console)({
    level: 'info',
    handleExceptions: true,
  }),
  new (winston.transports.File)({
    level: 'info',
    handleExceptions: true,
    filename: 'logfile.txt',
  }),
],
});

winston.addColors(logLevels.colors);

// ------------------------------------------//
export default logger;
