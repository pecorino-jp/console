/**
 * 口座ルーター
 * @ignore
 */
import * as pecorinoapi from '@motionpicture/pecorino-api-nodejs-client';
import * as express from 'express';

const accountsRouter = express.Router();
const authClient = new pecorinoapi.auth.ClientCredentials({
    domain: <string>process.env.PECORINO_API_AUTHORIZE_SERVER_DOMAIN,
    clientId: <string>process.env.PECORINO_API_CLIENT_ID,
    clientSecret: <string>process.env.PECORINO_API_CLIENT_SECRET,
    scopes: [],
    state: ''
});
const accountService = new pecorinoapi.service.Account({
    endpoint: <string>process.env.PECORINO_API_ENDPOINT,
    auth: authClient
});

/**
 * 口座検索
 */
accountsRouter.get(
    '/',
    async (req, res, next) => {
        try {
            const accounts = await accountService.search(req.query);
            res.render('accounts/index', { accounts: accounts });
        } catch (error) {
            next(error);
        }
    });

/**
 * 口座に対する転送アクション検索
 */
accountsRouter.get(
    '/:accountNumber/actions/MoneyTransfer',
    async (req, res, next) => {
        try {
            const actions = await accountService.searchMoneyTransferActions({ accountNumber: req.params.accountNumber });
            res.render('accounts/actions/moneyTransfer', {
                accountNumber: req.params.accountNumber,
                actions: actions
            });
        } catch (error) {
            next(error);
        }
    });

export default accountsRouter;
