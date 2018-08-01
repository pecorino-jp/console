/**
 * 口座ルーター
 * @ignore
 */
import * as pecorinoapi from '@pecorino/api-nodejs-client';
import * as createDebug from 'debug';
import * as express from 'express';

const debug = createDebug('pecorino-console:routes:account');
const accountsRouter = express.Router();

/**
 * 口座検索
 */
accountsRouter.get(
    '/',
    async (req, res, next) => {
        try {
            const accountService = new pecorinoapi.service.Account({
                endpoint: <string>process.env.PECORINO_API_ENDPOINT,
                auth: req.user.authClient
            });

            debug('searching accounts...', req.query);
            const accounts = await accountService.search({
                accountType: req.query.accountType,
                accountNumbers: (typeof req.query.accountNumber === 'string' && req.query.accountNumber.length > 0) ?
                    [req.query.accountNumber] :
                    [],
                statuses: [],
                name: req.query.name,
                limit: 100

            });
            res.render('accounts/index', {
                query: req.query,
                accounts: accounts
            });
        } catch (error) {
            next(error);
        }
    });

/**
 * 口座に対する転送アクション検索
 */
accountsRouter.get(
    '/:accountType/:accountNumber/actions/MoneyTransfer',
    async (req, res, next) => {
        try {
            const accountService = new pecorinoapi.service.Account({
                endpoint: <string>process.env.PECORINO_API_ENDPOINT,
                auth: req.user.authClient
            });

            const actions = await accountService.searchMoneyTransferActions({
                accountType: req.params.accountType,
                accountNumber: req.params.accountNumber
            });
            res.render('accounts/actions/moneyTransfer', {
                accountType: req.params.accountType,
                accountNumber: req.params.accountNumber,
                actions: actions
            });
        } catch (error) {
            next(error);
        }
    });

export default accountsRouter;
