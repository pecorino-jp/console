"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * セッションミドルウェア
 */
const connectRedis = require("connect-redis");
const session = require("express-session");
const redis_1 = require("../redis");
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
        maxAge: 3600000
    }
});
