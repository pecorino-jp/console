/**
 * アクションルーター
 */
import * as pecorinoapi from '@pecorino/api-nodejs-client';
import * as createDebug from 'debug';
import * as express from 'express';

const debug = createDebug('pecorino-console:router');
const actionsRouter = express.Router();

/**
 * 転送アクション検索
 */
actionsRouter.get(
    '/moneyTransfer',
    // tslint:disable-next-line:cyclomatic-complexity
    async (req, res, next) => {
        try {
            const actionService = new pecorinoapi.service.Action({
                endpoint: <string>process.env.PECORINO_API_ENDPOINT,
                auth: req.user.authClient
            });

            const searchConditions: pecorinoapi.factory.action.transfer.moneyTransfer.ISearchConditions<string> = {
                limit: req.query.limit,
                page: req.query.page,
                sort: { startDate: pecorinoapi.factory.sortType.Descending },
                accountType: <string>req.query.accountType,
                accountNumber: (typeof req.query.accountNumber === 'string' && req.query.accountNumber.length > 0) ?
                    <string>req.query.accountNumber :
                    undefined
            };

            if (req.query.format === 'datatable') {
                debug('searching accounts...', req.query);
                const { totalCount, data } = await actionService.searchMoneyTransferActions(searchConditions);
                res.json({
                    draw: req.query.draw,
                    recordsTotal: totalCount,
                    recordsFiltered: totalCount,
                    data: data
                });
            } else {
                res.render('actions/moneyTransfer/index', {
                    query: req.query
                });
            }
        } catch (error) {
            next(error);
        }
    }
);

export default actionsRouter;
