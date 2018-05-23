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
 * 入金取引開始
 */
transactionsRouter.all(
    '/deposit/start',
    async (req, res, next) => {
        try {
            let values: any = {};
            let message;
            if (req.method === 'POST') {
                values = req.body;

                try {
                    const depositTransactionService = new pecorinoapi.service.transaction.Deposit({
                        endpoint: <string>process.env.PECORINO_API_ENDPOINT,
                        auth: req.user.authClient
                    });
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
                    // セッションに取引追加
                    (<Express.Session>req.session)[`transaction:${transaction.id}`] = transaction;

                    res.redirect(`/transactions/deposit/${transaction.id}/confirm`);

                    return;
                } catch (error) {
                    message = error.message;
                }
            }

            res.render('transactions/deposit/start', {
                values: values,
                message: message
            });
        } catch (error) {
            next(error);
        }
    });

/**
 * 入金取引確認
 */
transactionsRouter.all(
    '/deposit/:transactionId/confirm',
    async (req, res, next) => {
        try {
            let message;
            const transaction = (<Express.Session>req.session)[`transaction:${req.params.transactionId}`];
            if (transaction === undefined) {
                throw new pecorinoapi.factory.errors.NotFound('Transaction in session');
            }

            if (req.method === 'POST') {
                // 確定
                const depositTransactionService = new pecorinoapi.service.transaction.Deposit({
                    endpoint: <string>process.env.PECORINO_API_ENDPOINT,
                    auth: req.user.authClient
                });
                await depositTransactionService.confirm({
                    transactionId: transaction.id
                });
                debug('取引確定です。');
                message = '入金取引を実行しました。';
                // セッション削除
                delete (<Express.Session>req.session)[`transaction:${req.params.transactionId}`];
                req.flash('message', '入金取引を実行しました。');
                res.redirect('/transactions/deposit/start');

                return;
            }

            res.render('transactions/deposit/confirm', {
                transaction: transaction,
                message: message
            });
        } catch (error) {
            next(error);
        }
    });

export default transactionsRouter;
