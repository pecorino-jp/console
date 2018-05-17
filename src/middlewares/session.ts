/**
 * セッションミドルウェア
 */
import * as connectRedis from 'connect-redis';
import * as session from 'express-session';

import redisClient from '../redis';

export default session({
    secret: 'pecorino-console-session-secret',
    resave: false,
    rolling: true,
    saveUninitialized: false,
    store: new (connectRedis(session))({
        client: redisClient
    }),
    cookie: {
        secure: true,
        httpOnly: true,
        maxAge: 3600000
    }
});
