/**
 * 取引ルーター
 * @ignore
 */
import * as pecorinoapi from '@motionpicture/pecorino-api-nodejs-client';
import * as createDebug from 'debug';
import * as express from 'express';
import * as moment from 'moment';

const debug = createDebug('pecorino-console:routes:account');
const transactionsRouter = express.Router();
const authClient = new pecorinoapi.auth.ClientCredentials({
    domain: <string>process.env.PECORINO_API_AUTHORIZE_SERVER_DOMAIN,
    clientId: <string>process.env.PECORINO_API_CLIENT_ID,
    clientSecret: <string>process.env.PECORINO_API_CLIENT_SECRET,
    scopes: [],
    state: ''
});
const depositTransactionService = new pecorinoapi.service.transaction.Deposit({
    endpoint: <string>process.env.PECORINO_API_ENDPOINT,
    auth: authClient
});

/**
 * 取引検索
 */
transactionsRouter.get(
    '/',
    async (req, _, next) => {
        try {
            debug('searching transactions...', req.query);
            throw new Error('Not implemented');
        } catch (error) {
            next(error);
        }
    });

/**
 * 入金取引
 */
transactionsRouter.all(
    '/deposit/new',
    async (req, res, next) => {
        try {
            let values: any = {};
            let message;
            if (req.method === 'POST') {
                values = req.body;

                try {
                    debug('取引が開始します...', values);
                    const transaction = await depositTransactionService.start({
                        // tslint:disable-next-line:no-magic-numbers
                        expires: moment().add(5, 'minutes').toDate(),
                        agent: {
                            typeOf: 'Organization',
                            id: 'agent-id',
                            name: values.fromName,
                            url: ''
                        },
                        recipient: {
                            typeOf: 'Person',
                            id: 'recipient-id',
                            name: 'recipient name',
                            url: ''
                        },
                        amount: parseInt(values.amount, 10),
                        notes: values.notes,
                        toAccountNumber: values.toAccountNumber
                    });
                    debug('取引が開始されました。', transaction.id);

                    // 確定
                    await depositTransactionService.confirm({
                        transactionId: transaction.id
                    });
                    debug('取引確定です。');
                    message = '入金取引を実行しました。';
                } catch (error) {
                    message = error.message;
                }
            }

            res.render('transactions/deposit/new', {
                values: values,
                message: message
            });
        } catch (error) {
            next(error);
        }
    });

export default transactionsRouter;
