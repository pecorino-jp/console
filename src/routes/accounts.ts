/**
 * 口座ルーター
 */
import * as pecorinoapi from '@pecorino/api-nodejs-client';
import * as createDebug from 'debug';
import * as express from 'express';
import { NO_CONTENT } from 'http-status';
import * as moment from 'moment';

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
            const searchConditions: pecorinoapi.factory.account.ISearchConditions = {
                limit: req.query.limit,
                page: req.query.page,
                sort: { openDate: pecorinoapi.factory.sortType.Descending },
                project: { id: { $eq: req.project.id } },
                accountType: (typeof req.query.accountType === 'string' && req.query.accountType.length > 0)
                    ? req.query.accountType
                    : undefined,
                statuses: (typeof req.query.status === 'string' && req.query.status.length > 0)
                    ? [req.query.status]
                    : undefined,
                accountNumber: {
                    $regex: (typeof req.query.accountNumber === 'string' && req.query.accountNumber.length > 0)
                        ? req.query.accountNumber
                        : undefined
                },
                name: <any>{
                    $regex: (typeof req.query.name === 'string' && req.query.name.length > 0) ? req.query.name : undefined
                },
                typeOf: {
                    $eq: (typeof req.query.typeOf === 'string' && req.query.typeOf.length > 0)
                        ? req.query.typeOf
                        : undefined
                }
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

                const productService = new chevreapi.service.Product({
                    endpoint: <string>process.env.CHEVRE_API_ENDPOINT,
                    auth: req.user.authClient
                });
                const searchPaymentCardsResult = await productService.search({
                    project: { id: { $eq: req.project.id } },
                    typeOf: { $in: [chevreapi.factory.product.ProductType.Account, chevreapi.factory.product.ProductType.PaymentCard] }
                });

                res.render('accounts/index', {
                    query: req.query,
                    accountTypes: searchAccountTypesResult.data,
                    paymentCards: searchPaymentCardsResult.data
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
    '/:accountNumber',
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
    '/:accountNumber/actions/moneyTransfer',
    async (req, res, next) => {
        try {
            const accountService = new pecorinoapi.service.Account({
                endpoint: <string>process.env.API_ENDPOINT,
                auth: req.user.authClient
            });
            const searchActionsResult = await accountService.searchMoneyTransferActions({
                limit: req.query.limit,
                page: req.query.page,
                sort: { startDate: pecorinoapi.factory.sortType.Descending },
                project: { id: { $eq: req.project.id } },
                accountNumber: req.params.accountNumber,
                startDate: {
                    $gte: moment()
                        .add(-1, 'month')
                        .toDate()
                }
            });
            res.json(searchActionsResult);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * 口座詳細
 * @deprecated Use /:accountNumber
 */
accountsRouter.get(
    '/:accountType/:accountNumber',
    async (req, res, next) => {
        try {
            res.redirect(`/projects/${req.project.id}/accounts/${req.params.accountNumber}`);
        } catch (error) {
            next(error);
        }
    }
);

export default accountsRouter;
