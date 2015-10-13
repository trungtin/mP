import logger from 'winston'

logger.setLevels({watcher:0, debug:1, info: 2, warn: 3,error:4,});
logger.addColors({debug: 'green', info:  'cyan', watcher: 'magenta', warn:  'yellow', error: 'red'});
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, { level: 'debug', colorize:true });
logger.add(logger.transports.File, {name: 'watcher', level: 'watcher', filename: 'api/log/watcher.json', json: true,
									prettyPrint: true, maxsize: 10000, maxFiles: 5})
logger.add(logger.transports.File, {
	name: 'exceptionLog',
  level: 'error',
  filename: 'api/log/exception.json',
  handleExceptions: true,
  json: true,
  prettyPrint: true,
  humanReadableUnhandledException: true
  })

export default logger