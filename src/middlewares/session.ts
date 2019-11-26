/**
 * セッションミドルウェア
 */
import * as connectRedis from 'connect-redis';
import * as session from 'express-session';

import redisClient from '../redis';

const EXPIRES = Number(<string>process.env.USER_EXPIRES_IN_SECONDS);
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
        // tslint:disable-next-line:no-magic-numbers
        maxAge: EXPIRES * 1000
    }
});
