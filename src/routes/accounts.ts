/**
 * 口座ルーター
 */
import * as pecorinoapi from '@pecorino/api-nodejs-client';
import * as createDebug from 'debug';
import * as express from 'express';
import { NO_CONTENT } from 'http-status';

import * as chevreapi from '../chevreapi';

const debug = createDebug('pecorino-console:router');
const accountsRouter = express.Router();

/**
 * 口座検索
 */
accountsRouter.get(
    '/',
    async (req, res, next) => {
        try {
            const accountService = new pecorinoapi.service.Account({
                endpoint: <string>process.env.API_ENDPOINT,
                auth: req.user.authClient
            });
            const searchConditions: pecorinoapi.factory.account.ISearchConditions<string> = {
                limit: req.query.limit,
                page: req.query.page,
                sort: { openDate: pecorinoapi.factory.sortType.Descending },
                project: { id: { $eq: req.project.id } },
                accountType: req.query.accountType,
                accountNumbers: (typeof req.query.accountNumber === 'string' && req.query.accountNumber.length > 0) ?
                    [req.query.accountNumber] :
                    [],
                statuses: [],
                name: req.query.name
            };
            if (req.query.format === 'datatable') {
                debug('searching accounts...', req.query);
                const { data } = await accountService.search(searchConditions);
                res.json({
                    draw: req.query.draw,
                    // recordsTotal: data.length,
                    recordsFiltered: (data.length === Number(searchConditions.limit))
                        ? (Number(searchConditions.page) * Number(searchConditions.limit)) + 1
                        : ((Number(searchConditions.page) - 1) * Number(searchConditions.limit)) + Number(data.length),
                    data: data
                });
            } else {
                const categoryCodeService = new chevreapi.service.CategoryCode({
                    endpoint: <string>process.env.CHEVRE_API_ENDPOINT,
                    auth: req.user.authClient
                });
                const searchAccountTypesResult = await categoryCodeService.search({
                    project: { id: { $eq: req.project.id } },
                    inCodeSet: { identifier: { $eq: chevreapi.factory.categoryCode.CategorySetIdentifier.AccountType } }
                });

                res.render('accounts/index', {
                    query: req.query,
                    accountTypes: searchAccountTypesResult.data
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
accountsRouter.all(
    '/:accountType/:accountNumber',
    async (req, res, next) => {
        try {
            let message;

            const accountService = new pecorinoapi.service.Account({
                endpoint: <string>process.env.API_ENDPOINT,
                auth: req.user.authClient
            });
            const { data } = await accountService.search({
                limit: 1,
                project: { id: { $eq: req.project.id } },
                statuses: [],
                accountType: req.params.accountType,
                accountNumbers: [req.params.accountNumber]
            });
            if (data.length < 1) {
                throw new pecorinoapi.factory.errors.NotFound('Account');
            }
            const account = data[0];

            if (req.method === 'DELETE') {
                res.status(NO_CONTENT)
                    .end();

                return;
            } else if (req.method === 'POST') {
                try {
                    await accountService.update({
                        accountType: req.params.accountType,
                        accountNumber: req.params.accountNumber,
                        name: req.body.name
                    });
                    req.flash('message', '更新しました');
                    res.redirect(req.originalUrl);

                    return;
                } catch (error) {
                    message = error.message;
                }
            }

            res.render('accounts/show', {
                message: message,
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
                endpoint: <string>process.env.API_ENDPOINT,
                auth: req.user.authClient
            });
            const searchActionsResult = await accountService.searchMoneyTransferActions({
                limit: req.query.limit,
                page: req.query.page,
                project: { id: { $eq: req.project.id } },
                accountType: req.params.accountType,
                accountNumber: req.params.accountNumber,
                sort: { startDate: pecorinoapi.factory.sortType.Descending }
            });
            res.json(searchActionsResult);
        } catch (error) {
            next(error);
        }
    }
);

export default accountsRouter;
