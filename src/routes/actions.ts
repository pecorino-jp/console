/**
 * アクションルーター
 */
import { chevre as chevreapi } from '@cinerino/sdk';
import * as createDebug from 'debug';
import * as express from 'express';

const debug = createDebug('pecorino-console:router');
const actionsRouter = express.Router();

/**
 * 出入金検索
 */
actionsRouter.get(
    '/moneyTransfer',
    async (req, res, next) => {
        try {
            const actionService = new chevreapi.service.AccountAction({
                endpoint: <string>process.env.CHEVRE_API_ENDPOINT,
                auth: req.user.authClient,
                project: { id: req.project.id }
            });

            const actionStatusEq = req.query.actionStatus;
            const purposeTypeOfEq = req.query.purpose?.typeOf;
            const purposeIdEq = req.query.purpose?.id;
            const searchConditions: chevreapi.factory.account.action.moneyTransfer.ISearchConditions = {
                limit: req.query.limit,
                page: req.query.page,
                sort: { startDate: chevreapi.factory.sortType.Descending },
                project: { id: { $eq: req.project.id } },
                actionStatus: {
                    $in: (typeof actionStatusEq === 'string' && actionStatusEq.length > 0)
                        ? [<chevreapi.factory.actionStatusType>actionStatusEq]
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
                    id: { $eq: (typeof purposeIdEq === 'string' && purposeIdEq.length > 0) ? purposeIdEq : undefined },
                    identifier: {
                        $eq: (typeof req.query.purpose?.identifier === 'string'
                            && req.query.purpose.identifier.length > 0) ? req.query.purpose.identifier : undefined
                    }
                }
            };

            if (req.query.format === 'datatable') {
                debug('searching accounts...', req.query);
                const { data } = await actionService.search(searchConditions);
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
                    auth: req.user.authClient,
                    project: { id: req.project.id }
                });
                const searchAccountTypesResult = await categoryCodeService.search({
                    project: { id: { $eq: req.project.id } },
                    inCodeSet: { identifier: { $eq: chevreapi.factory.categoryCode.CategorySetIdentifier.CurrencyType } }
                });

                res.render('actions/moneyTransfer/index', {
                    query: req.query,
                    accountTypes: searchAccountTypesResult.data
                });
            }
        } catch (error) {
            next(error);
        }
    }
);

export default actionsRouter;
