/**
 * 認証ルーター
 */
import * as express from 'express';
// import * as request from 'request-promise-native';

import User from '../user';

const authRouter = express.Router();
/**
 * サインイン
 * Cognitoからリダイレクトしてくる
 */
// tslint:disable-next-line:no-single-line-block-comment
/* istanbul ignore next */
authRouter.get(
    '/signIn',
    async (req, res, next) => {
        try {
            const user = new User({
                host: req.hostname,
                session: <Express.Session>req.session,
                state: req.originalUrl
            });
            await user.signIn(req.query.code);
            const redirect = (req.query.state !== undefined) ? req.query.state : '/';
            res.redirect(redirect);
        } catch (error) {
            next(error);
        }
    }
);
/**
 * ログアウト
 */
// tslint:disable-next-line:no-single-line-block-comment
/* istanbul ignore next */
authRouter.get(
    '/logout',
    async (req, res, next) => {
        try {
            const user = new User({
                host: req.hostname,
                session: <Express.Session>req.session,
                state: req.originalUrl
            });
            user.logout();
            res.redirect('/');
        } catch (error) {
            next(error);
        }
    }
);
export default authRouter;
