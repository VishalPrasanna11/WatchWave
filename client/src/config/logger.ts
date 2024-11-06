// logger.ts

import log from 'loglevel';

// Set the default logging level (can be 'debug', 'info', 'warn', 'error')
log.setLevel('info');

// Optionally, you can add custom logging functions if needed
const logger = {
    info: (message: string) => log.info(message),
    warn: (message: string) => log.warn(message),
    error: (message: string) => log.error(message),
    debug: (message: string) => log.debug(message),
};

export default logger;
