/**
 * 取引ルーター
 */
import * as pecorinoapi from '@pecorino/api-nodejs-client';
import * as createDebug from 'debug';
import * as express from 'express';
import * as moment from 'moment';

import * as chevreapi from '../chevreapi';

const debug = createDebug('pecorino-console:router');
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
                        endpoint: <string>process.env.API_ENDPOINT,
                        auth: req.user.authClient
                    });
                    debug('取引を開始します...', values);
                    const transaction = await depositTransactionService.start({
                        project: req.project,
                        typeOf: pecorinoapi.factory.transactionType.Deposit,
                        expires: moment().add(1, 'minutes').toDate(),
                        agent: {
                            typeOf: 'Person',
                            id: req.user.profile.sub,
                            name: values.fromName
                        },
                        recipient: {
                            typeOf: 'Person',
                            id: '',
                            name: values.recipientName
                        },
                        object: {
                            amount: Number(values.amount),
                            description: values.description,
                            toLocation: {
                                typeOf: pecorinoapi.factory.account.TypeOf.Account,
                                accountType: values.accountType,
                                accountNumber: values.toAccountNumber
                            }
                        }
                    });
                    debug('取引が開始されました。', transaction.id);
                    // セッションに取引追加
                    (<Express.Session>req.session)[`transaction:${transaction.id}`] = transaction;

                    res.redirect(`/projects/${req.project.id}/transactions/deposit/${transaction.id}/confirm`);

                    return;
                } catch (error) {
                    message = error.message;
                }
            }

            const categoryCodeService = new chevreapi.service.CategoryCode({
                endpoint: <string>process.env.CHEVRE_API_ENDPOINT,
                auth: req.user.authClient
            });
            const searchAccountTypesResult = await categoryCodeService.search({
                project: { id: { $eq: req.project.id } },
                inCodeSet: { identifier: { $eq: chevreapi.factory.categoryCode.CategorySetIdentifier.AccountType } }
            });

            res.render('transactions/deposit/start', {
                values: values,
                message: message,
                accountTypes: searchAccountTypesResult.data
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
            let toAccount: pecorinoapi.factory.account.IAccount<pecorinoapi.factory.account.AccountType> | undefined;
            const transaction = <pecorinoapi.factory.transaction.deposit.ITransaction<pecorinoapi.factory.account.AccountType>>
                (<Express.Session>req.session)[`transaction:${req.params.transactionId}`];
            if (transaction === undefined) {
                throw new pecorinoapi.factory.errors.NotFound('Transaction in session');
            }

            if (req.method === 'POST') {
                // 確定
                const depositTransactionService = new pecorinoapi.service.transaction.Deposit({
                    endpoint: <string>process.env.API_ENDPOINT,
                    auth: req.user.authClient
                });
                await depositTransactionService.confirm(transaction);
                debug('取引確定です。');
                message = '入金取引を実行しました。';
                // セッション削除
                delete (<Express.Session>req.session)[`transaction:${req.params.transactionId}`];
                req.flash('message', '入金取引を実行しました。');
                res.redirect(`/projects/${req.project.id}/transactions/deposit/start`);

                return;
            } else {
                // 入金先口座情報を検索
                const accountService = new pecorinoapi.service.Account({
                    endpoint: <string>process.env.API_ENDPOINT,
                    auth: req.user.authClient
                });
                const searchAccountsResult = await accountService.search({
                    accountType: transaction.object.toLocation.accountType,
                    accountNumbers: [transaction.object.toLocation.accountNumber],
                    statuses: [],
                    limit: 1
                });
                toAccount = searchAccountsResult.data.shift();
                if (toAccount === undefined) {
                    throw new Error('To Location Not Found');
                }
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
                        endpoint: <string>process.env.API_ENDPOINT,
                        auth: req.user.authClient
                    });
                    debug('取引を開始します...', values);
                    const transaction = await withdrawService.start({
                        project: req.project,
                        typeOf: pecorinoapi.factory.transactionType.Withdraw,
                        expires: moment().add(1, 'minutes').toDate(),
                        agent: {
                            typeOf: 'Person',
                            id: req.user.profile.sub,
                            name: values.fromName
                        },
                        recipient: {
                            typeOf: 'Person',
                            id: '',
                            name: values.recipientName
                        },
                        object: {
                            amount: Number(values.amount),
                            description: values.description,
                            fromLocation: {
                                typeOf: pecorinoapi.factory.account.TypeOf.Account,
                                accountType: values.accountType,
                                accountNumber: values.fromAccountNumber
                            }
                        }
                    });
                    debug('取引が開始されました。', transaction.id);
                    // セッションに取引追加
                    (<Express.Session>req.session)[`transaction:${transaction.id}`] = transaction;

                    res.redirect(`/projects/${req.project.id}/transactions/withdraw/${transaction.id}/confirm`);

                    return;
                } catch (error) {
                    message = error.message;
                }
            }

            const categoryCodeService = new chevreapi.service.CategoryCode({
                endpoint: <string>process.env.CHEVRE_API_ENDPOINT,
                auth: req.user.authClient
            });
            const searchAccountTypesResult = await categoryCodeService.search({
                project: { id: { $eq: req.project.id } },
                inCodeSet: { identifier: { $eq: chevreapi.factory.categoryCode.CategorySetIdentifier.AccountType } }
            });

            res.render('transactions/withdraw/start', {
                values: values,
                message: message,
                accountTypes: searchAccountTypesResult.data
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
            let fromAccount: pecorinoapi.factory.account.IAccount<pecorinoapi.factory.account.AccountType> | undefined;
            const transaction = <pecorinoapi.factory.transaction.withdraw.ITransaction<pecorinoapi.factory.account.AccountType>>
                (<Express.Session>req.session)[`transaction:${req.params.transactionId}`];
            if (transaction === undefined) {
                throw new pecorinoapi.factory.errors.NotFound('Transaction in session');
            }

            if (req.method === 'POST') {
                // 確定
                const withdrawService = new pecorinoapi.service.transaction.Withdraw({
                    endpoint: <string>process.env.API_ENDPOINT,
                    auth: req.user.authClient
                });
                await withdrawService.confirm(transaction);
                debug('取引確定です。');
                message = '出金取引を実行しました。';
                // セッション削除
                delete (<Express.Session>req.session)[`transaction:${req.params.transactionId}`];
                req.flash('message', '出金取引を実行しました。');
                res.redirect(`/projects/${req.project.id}/transactions/withdraw/start`);

                return;
            } else {
                // 入金先口座情報を検索
                const accountService = new pecorinoapi.service.Account({
                    endpoint: <string>process.env.API_ENDPOINT,
                    auth: req.user.authClient
                });
                const searchAccountsResult = await accountService.search({
                    accountType: transaction.object.fromLocation.accountType,
                    accountNumbers: [transaction.object.fromLocation.accountNumber],
                    statuses: [],
                    limit: 1
                });
                fromAccount = searchAccountsResult.data.shift();
                if (fromAccount === undefined) {
                    throw new Error('From Location Not Found');
                }
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

/**
 * 転送取引開始
 */
transactionsRouter.all(
    '/transfer/start',
    async (req, res, next) => {
        try {
            let values: any = {};
            let message;
            if (req.method === 'POST') {
                values = req.body;

                try {
                    const transferService = new pecorinoapi.service.transaction.Transfer({
                        endpoint: <string>process.env.API_ENDPOINT,
                        auth: req.user.authClient
                    });
                    debug('取引を開始します...', values);
                    const transaction = await transferService.start({
                        project: req.project,
                        typeOf: pecorinoapi.factory.transactionType.Transfer,
                        expires: moment().add(1, 'minutes').toDate(),
                        agent: {
                            typeOf: 'Person',
                            id: req.user.profile.sub,
                            name: values.fromName
                        },
                        recipient: {
                            typeOf: 'Person',
                            id: '',
                            name: values.recipientName
                        },
                        object: {
                            amount: Number(values.amount),
                            fromLocation: {
                                typeOf: pecorinoapi.factory.account.TypeOf.Account,
                                accountType: values.accountType,
                                accountNumber: values.fromAccountNumber
                            },
                            toLocation: {
                                typeOf: pecorinoapi.factory.account.TypeOf.Account,
                                accountType: values.accountType,
                                accountNumber: values.toAccountNumber
                            },
                            description: values.description
                        }
                    });
                    debug('取引が開始されました。', transaction.id);
                    // セッションに取引追加
                    (<Express.Session>req.session)[`transaction:${transaction.id}`] = transaction;

                    res.redirect(`/projects/${req.project.id}/transactions/transfer/${transaction.id}/confirm`);

                    return;
                } catch (error) {
                    message = error.message;
                }
            }

            const categoryCodeService = new chevreapi.service.CategoryCode({
                endpoint: <string>process.env.CHEVRE_API_ENDPOINT,
                auth: req.user.authClient
            });
            const searchAccountTypesResult = await categoryCodeService.search({
                project: { id: { $eq: req.project.id } },
                inCodeSet: { identifier: { $eq: chevreapi.factory.categoryCode.CategorySetIdentifier.AccountType } }
            });

            res.render('transactions/transfer/start', {
                values: values,
                message: message,
                accountTypes: searchAccountTypesResult.data
            });
        } catch (error) {
            next(error);
        }
    });

/**
 * 転送取引確認
 */
transactionsRouter.all(
    '/transfer/:transactionId/confirm',
    async (req, res, next) => {
        try {
            let message;
            let fromAccount: pecorinoapi.factory.account.IAccount<pecorinoapi.factory.account.AccountType> | undefined;
            let toAccount: pecorinoapi.factory.account.IAccount<pecorinoapi.factory.account.AccountType> | undefined;
            const transaction = <pecorinoapi.factory.transaction.transfer.ITransaction<pecorinoapi.factory.account.AccountType>>
                (<Express.Session>req.session)[`transaction:${req.params.transactionId}`];
            if (transaction === undefined) {
                throw new pecorinoapi.factory.errors.NotFound('Transaction in session');
            }

            if (req.method === 'POST') {
                // 確定
                const transferService = new pecorinoapi.service.transaction.Transfer({
                    endpoint: <string>process.env.API_ENDPOINT,
                    auth: req.user.authClient
                });
                await transferService.confirm(transaction);
                debug('取引確定です。');
                message = '転送取引を実行しました。';
                // セッション削除
                delete (<Express.Session>req.session)[`transaction:${req.params.transactionId}`];
                req.flash('message', '転送取引を実行しました。');
                res.redirect(`/projects/${req.project.id}/transactions/transfer/start`);

                return;
            } else {
                // 転送元、転送先口座情報を検索
                const accountService = new pecorinoapi.service.Account({
                    endpoint: <string>process.env.API_ENDPOINT,
                    auth: req.user.authClient
                });
                let searchAccountsResult = await accountService.search({
                    accountType: transaction.object.fromLocation.accountType,
                    accountNumbers: [transaction.object.fromLocation.accountNumber],
                    statuses: [],
                    limit: 1
                });
                fromAccount = searchAccountsResult.data.shift();

                searchAccountsResult = await accountService.search({
                    accountType: transaction.object.toLocation.accountType,
                    accountNumbers: [transaction.object.toLocation.accountNumber],
                    statuses: [],
                    limit: 1
                });
                toAccount = searchAccountsResult.data.shift();
                if (toAccount === undefined) {
                    throw new Error('To Location Not Found');
                }
            }

            res.render('transactions/transfer/confirm', {
                transaction: transaction,
                message: message,
                fromAccount: fromAccount,
                toAccount: toAccount
            });
        } catch (error) {
            next(error);
        }
    });

export default transactionsRouter;
