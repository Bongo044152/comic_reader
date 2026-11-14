import express from 'express';
import session from 'express-session';
import swaggerUi from 'swagger-ui-express';
import createSqliteSessionStore from 'better-sqlite3-session-store';
import logger from './utils/logger.js';
import authRoutes from './routes/authRoute.js';
import swaggerDoc from './swagger.json' with { type: 'json' };
import { db } from './utils/db.js'
import { authMiddleware } from './middlewares/authMiddleware.js';

const app = express();
const PORT: number = Number(process.env.PORT) || 5090;
const SqliteStore = createSqliteSessionStore(session);

app.set('trust proxy', true);
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
    secret: "HAHAHAHAHAH",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,               // 上線 HTTPS 後改 true
        maxAge: 1000 * 60 * 60 * 24 * 7,
    },
}));

app.use(logger);
app.use(authMiddleware);
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
    logger.logger.info(`listening on port: ${PORT}`);
});
