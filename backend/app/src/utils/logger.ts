import { pinoHttp } from 'pino-http';

/*
    The default logger of this application.
    Any other logger should be created as a child of this one.
*/
// docs: https://www.npmjs.com/package/pino-http#api
const logger = pinoHttp({
    level: process.env.LOG_LEVEL || "info",
    formatters: {
        level: (level) => {
            return {level: level.toUpperCase()}
        },
    },
    /* temporary set below */
    autoLogging: false,
    quietReqLogger: true,
    quietResLogger: true,
});

export default logger;
