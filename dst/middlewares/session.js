"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * セッションミドルウェア
 */
const connectRedis = require("connect-redis");
const session = require("express-session");
const redis_1 = require("../redis");
const EXPIRES = Number(process.env.USER_EXPIRES_IN_SECONDS);
exports.default = session({
    secret: 'pecorino-console-session-secret',
    resave: false,
    rolling: true,
    saveUninitialized: false,
    store: new (connectRedis(session))({
        client: redis_1.default
    }),
    cookie: {
        secure: true,
        httpOnly: true,
        // tslint:disable-next-line:no-magic-numbers
        maxAge: EXPIRES * 1000
    }
});
