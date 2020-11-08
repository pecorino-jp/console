/**
 * アクションルーター
 */
import * as pecorinoapi from '@pecorino/api-nodejs-client';
import * as createDebug from 'debug';
import * as express from 'express';

import * as chevreapi from '../chevreapi';

const debug = createDebug('pecorino-console:router');
const actionsRouter = express.Router();

/**
 * 出入金検索
 */
actionsRouter.get(
    '/moneyTransfer',
    async (req, res, next) => {
        try {
            const actionService = new pecorinoapi.service.Action({
                endpoint: <string>process.env.API_ENDPOINT,
                auth: req.user.authClient
            });

            const actionStatusEq = req.query.actionStatus;
            const purposeTypeOfEq = req.query.purpose?.typeOf;
            const purposeIdEq = req.query.purpose?.id;
            const searchConditions: pecorinoapi.factory.action.transfer.moneyTransfer.ISearchConditions = {
                limit: req.query.limit,
                page: req.query.page,
                sort: { startDate: pecorinoapi.factory.sortType.Descending },
                project: { id: { $eq: req.project.id } },
                actionStatus: {
                    $in: (typeof actionStatusEq === 'string' && actionStatusEq.length > 0)
                        ? [<pecorinoapi.factory.actionStatusType>actionStatusEq]
                        : undefined
                },
                amount: {
                    currency: {
                        $eq: (typeof req.query.accountType === 'string' && req.query.accountType.length > 0)
                            ? <string>req.query.accountType
                            : undefined
                    }
                },
                location: {
                    accountNumber: {
                        $eq: (typeof req.query.accountNumber === 'string' && req.query.accountNumber.length > 0)
                            ? req.query.accountNumber
                            : undefined
                    },
                    typeOf: {
                        $eq: (typeof req.query.location?.typeOf === 'string' && req.query.location.typeOf.length > 0)
                            ? req.query.location.typeOf
                            : undefined
                    }
                },
                purpose: {
                    typeOf: { $eq: (typeof purposeTypeOfEq === 'string' && purposeTypeOfEq.length > 0) ? purposeTypeOfEq : undefined },
                    id: { $eq: (typeof purposeIdEq === 'string' && purposeIdEq.length > 0) ? purposeIdEq : undefined }
                }
            };

            if (req.query.format === 'datatable') {
                debug('searching accounts...', req.query);
                const { data } = await actionService.searchMoneyTransferActions(searchConditions);
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
                    typeOf: { $eq: 'PaymentCard' }
                });

                res.render('actions/moneyTransfer/index', {
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

export default actionsRouter;
