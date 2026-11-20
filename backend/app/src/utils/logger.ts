import { pinoHttp } from 'pino-http';
import { requireEnv } from './env.js';

/*
    The default logger of this application.
    Any other logger should be created as a child of this one.
*/
// docs: https://www.npmjs.com/package/pino-http#api
const logger = pinoHttp({
    level: requireEnv('LOG_LEVEL'),
    formatters: {
        level: (level) => {
            return {level: level.toUpperCase()}
        },
    },
    /* temporary set below */
    autoLogging: false,
    quietResLogger: true,
    serializers: {
        req: (req) => ({
            id: req.id,
            method: req.method,
            url: req.url,
            ip: req.raw.ip,
            userId: req.raw.session?.userId,
        }),
    },
});

export default logger;
