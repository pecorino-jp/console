/**
 * 取引ルーター
 */
import * as pecorinoapi from '@pecorino/api-nodejs-client';
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
                    debug('取引を開始します...', values);
                    const transaction = await depositTransactionService.start({
                        expires: moment().add(1, 'minutes').toDate(),
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
                        accountType: values.accountType,
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
            let toAccount: pecorinoapi.factory.account.IAccount<pecorinoapi.factory.account.AccountType>;
            const transaction = <pecorinoapi.factory.transaction.deposit.ITransaction<pecorinoapi.factory.account.AccountType>>
                (<Express.Session>req.session)[`transaction:${req.params.transactionId}`];
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
            } else {
                // 入金先口座情報を検索
                const accountService = new pecorinoapi.service.Account({
                    endpoint: <string>process.env.PECORINO_API_ENDPOINT,
                    auth: req.user.authClient
                });
                const searchAccountsResult = await accountService.searchWithTotalCount({
                    accountType: transaction.object.accountType,
                    accountNumbers: [transaction.object.toAccountNumber],
                    statuses: [],
                    limit: 1
                });
                const account = searchAccountsResult.data.shift();
                if (account === undefined) {
                    throw new Error('to account not found');
                }
                toAccount = account;
            }

            res.render('transactions/deposit/confirm', {
                transaction: transaction,
                message: message,
                toAccount: toAccount
            });
        } catch (error) {
            next(error);
        }
    });

/**
 * 出金取引開始
 */
transactionsRouter.all(
    '/withdraw/start',
    async (req, res, next) => {
        try {
            let values: any = {};
            let message;
            if (req.method === 'POST') {
                values = req.body;

                try {
                    const withdrawService = new pecorinoapi.service.transaction.Withdraw({
                        endpoint: <string>process.env.PECORINO_API_ENDPOINT,
                        auth: req.user.authClient
                    });
                    debug('取引を開始します...', values);
                    const transaction = await withdrawService.start({
                        expires: moment().add(1, 'minutes').toDate(),
                        agent: {
                            typeOf: 'Person',
                            id: req.user.profile.sub,
                            name: values.fromName
                        },
                        recipient: {
                            typeOf: 'Person',
                            id: 'recipient-id',
                            name: 'recipient name',
                            url: ''
                        },
                        amount: parseInt(values.amount, 10),
                        accountType: values.accountType,
                        notes: values.notes,
                        fromAccountNumber: values.fromAccountNumber
                    });
                    debug('取引が開始されました。', transaction.id);
                    // セッションに取引追加
                    (<Express.Session>req.session)[`transaction:${transaction.id}`] = transaction;

                    res.redirect(`/transactions/withdraw/${transaction.id}/confirm`);

                    return;
                } catch (error) {
                    message = error.message;
                }
            }

            res.render('transactions/withdraw/start', {
                values: values,
                message: message
            });
        } catch (error) {
            next(error);
        }
    });

/**
 * 出金取引確認
 */
transactionsRouter.all(
    '/withdraw/:transactionId/confirm',
    async (req, res, next) => {
        try {
            let message;
            let fromAccount: pecorinoapi.factory.account.IAccount<pecorinoapi.factory.account.AccountType>;
            const transaction = <pecorinoapi.factory.transaction.withdraw.ITransaction<pecorinoapi.factory.account.AccountType>>
                (<Express.Session>req.session)[`transaction:${req.params.transactionId}`];
            if (transaction === undefined) {
                throw new pecorinoapi.factory.errors.NotFound('Transaction in session');
            }

            if (req.method === 'POST') {
                // 確定
                const withdrawService = new pecorinoapi.service.transaction.Withdraw({
                    endpoint: <string>process.env.PECORINO_API_ENDPOINT,
                    auth: req.user.authClient
                });
                await withdrawService.confirm({
                    transactionId: transaction.id
                });
                debug('取引確定です。');
                message = '出金取引を実行しました。';
                // セッション削除
                delete (<Express.Session>req.session)[`transaction:${req.params.transactionId}`];
                req.flash('message', '出金取引を実行しました。');
                res.redirect('/transactions/withdraw/start');

                return;
            } else {
                // 入金先口座情報を検索
                const accountService = new pecorinoapi.service.Account({
                    endpoint: <string>process.env.PECORINO_API_ENDPOINT,
                    auth: req.user.authClient
                });
                const searchAccountsResult = await accountService.searchWithTotalCount({
                    accountType: transaction.object.accountType,
                    accountNumbers: [transaction.object.fromAccountNumber],
                    statuses: [],
                    limit: 1
                });
                const account = searchAccountsResult.data.shift();
                if (account === undefined) {
                    throw new Error('to account not found');
                }
                fromAccount = account;
            }

            res.render('transactions/withdraw/confirm', {
                transaction: transaction,
                message: message,
                fromAccount: fromAccount
            });
        } catch (error) {
            next(error);
        }
    });

export default transactionsRouter;
