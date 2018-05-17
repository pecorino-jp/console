/**
 * `ホーム`ルーター
 * @ignore
 */
import * as express from 'express';

const homeRouter = express.Router();

homeRouter.get(
    '/',
    async (_, res, next) => {
        try {
            res.render('index', { message: 'Welcome to Pecorino Console!' });
        } catch (error) {
            next(error);
        }
    });

export default homeRouter;
