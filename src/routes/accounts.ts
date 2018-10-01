/**
 * 口座ルーター
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
    // tslint:disable-next-line:cyclomatic-complexity
    async (req, res, next) => {
        try {
            const accountService = new pecorinoapi.service.Account({
                endpoint: <string>process.env.PECORINO_API_ENDPOINT,
                auth: req.user.authClient
            });
            const searchConditions: pecorinoapi.factory.account.ISearchConditions<string> = {
                limit: req.query.limit,
                page: req.query.page,
                accountType: req.query.accountType,
                accountNumbers: (typeof req.query.accountNumber === 'string' && req.query.accountNumber.length > 0) ?
                    [req.query.accountNumber] :
                    [],
                statuses: [],
                name: req.query.name
            };
            if (req.query.format === 'datatable') {
                debug('searching accounts...', req.query);
                const accounts = await accountService.search(searchConditions);
                res.json({
                    draw: req.query.draw,
                    recordsTotal: 100,
                    recordsFiltered: accounts.length,
                    data: accounts
                });
            } else {
                res.render('accounts/index', {
                    query: req.query
                });
            }
        } catch (error) {
            next(error);
        }
    }
);
/**
 * 口座詳細
 */
accountsRouter.get(
    '/:accountType/:accountNumber',
    async (req, res, next) => {
        try {
            const accountService = new pecorinoapi.service.Account({
                endpoint: <string>process.env.PECORINO_API_ENDPOINT,
                auth: req.user.authClient
            });
            const searchAccountsResult = await accountService.search({
                limit: 1,
                statuses: [],
                accountType: req.params.accountType,
                accountNumbers: [req.params.accountNumber]
            });
            const account = searchAccountsResult[0];
            if (account === undefined) {
                throw new pecorinoapi.factory.errors.NotFound('Account');
            }
            res.render('accounts/show', {
                message: '',
                account: account
            });
        } catch (error) {
            next(error);
        }
    }
);
/**
 * 取引検索
 */
accountsRouter.get(
    '/:accountType/:accountNumber/actions/moneyTransfer',
    async (req, res, next) => {
        try {
            const accountService = new pecorinoapi.service.Account({
                endpoint: <string>process.env.PECORINO_API_ENDPOINT,
                auth: req.user.authClient
            });
            const actions = await accountService.searchMoneyTransferActions({
                limit: req.query.limit,
                page: req.query.page,
                accountType: req.params.accountType,
                accountNumber: req.params.accountNumber,
                sort: {
                    endDate: -1
                }
            });
            res.json({
                totalCount: 100,
                data: actions
            });
        } catch (error) {
            next(error);
        }
    }
);
export default accountsRouter;
