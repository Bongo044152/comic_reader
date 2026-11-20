import express from 'express';
import session from 'express-session';
import swaggerUi from 'swagger-ui-express';
import createSqliteSessionStore from 'better-sqlite3-session-store';
import logger from './utils/logger.js';
import { requireEnv } from './utils/env.js';
import authRoutes from './routes/authRoute.js';
import userRoutes from './routes/userRoute.js';
import swaggerDoc from './swagger.json' with { type: 'json' };
import { db } from './utils/db.js'
import { errorMiddleware } from './middlewares/errorMiddleware.js';

const app = express();
const PORT: number = Number(requireEnv('PORT'));
const ADMIN_PORT: number = Number(requireEnv('ADMIN_PORT'));
const SqliteStore = createSqliteSessionStore(session);
const session_secret = requireEnv('SESSION_SECRET');

app.set('trust proxy', true);
app.use(logger);
app.use(express.json());

// swagger setting
// docs: https://www.npmjs.com/package/swagger-ui-express
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// session setting
// docs: https://www.npmjs.com/package/express-session
app.use(session({
    store: new SqliteStore({
        client: db,
        expired: { clear: true, intervalMs: 15 * 60 * 1000 },
    }),
    name: "sid",
    secret: session_secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,               // 上線 HTTPS 後改 true
        maxAge: 1000 * 60 * 60 * 24 * 7,
    },
}));

app.use('/api/auth', authRoutes);
app.use(errorMiddleware);

app.listen(PORT, (err) => {
    if(err) {
        logger.logger.error(err.message);
        throw err;
    }
    logger.logger.info(`listening on port: ${PORT}`);
});

// 管理用
const adminApp = express();
adminApp.use(logger);
adminApp.use(express.json());
adminApp.use('/api/users', userRoutes);
adminApp.use(errorMiddleware);

adminApp.listen(ADMIN_PORT, () => {
    logger.logger.info(`admin listening on port: ${ADMIN_PORT}`);
});
