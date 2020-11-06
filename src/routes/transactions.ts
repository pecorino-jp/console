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
 * 取引開始
 */
transactionsRouter.all(
    '/start',
    async (req, res, next) => {
        try {
            let values: any = {};
            let message = '';
            if (req.method === 'POST') {
                values = req.body;

                try {
                    let transaction: pecorinoapi.factory.transaction.ITransaction<any>;

                    switch (req.body.transactionType) {
                        case pecorinoapi.factory.transactionType.Deposit:
                            const depositService = new pecorinoapi.service.transaction.Deposit({
                                endpoint: <string>process.env.API_ENDPOINT,
                                auth: req.user.authClient
                            });
                            transaction = await depositService.start(
                                <pecorinoapi.factory.transaction.deposit.IStartParamsWithoutDetail>createStartParams(req)
                            );

                            break;

                        case pecorinoapi.factory.transactionType.Transfer:
                            const transferService = new pecorinoapi.service.transaction.Transfer({
                                endpoint: <string>process.env.API_ENDPOINT,
                                auth: req.user.authClient
                            });
                            transaction = await transferService.start(
                                <pecorinoapi.factory.transaction.transfer.IStartParamsWithoutDetail>createStartParams(req)
                            );

                            break;

                        case pecorinoapi.factory.transactionType.Withdraw:
                            const withdrawService = new pecorinoapi.service.transaction.Withdraw({
                                endpoint: <string>process.env.API_ENDPOINT,
                                auth: req.user.authClient
                            });
                            transaction = await withdrawService.start(
                                <pecorinoapi.factory.transaction.withdraw.IStartParamsWithoutDetail>createStartParams(req)
                            );

                            break;

                        default:
                            throw new Error(`Transaction type ${req.body.transactionType} not implemented`);
                    }

                    // セッションに取引追加
                    (<Express.Session>req.session)[`transaction:${transaction.id}`] = transaction;

                    res.redirect(`/projects/${req.project.id}/transactions/${transaction.id}/confirm`);

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

            res.render('transactions/start', {
                values: values,
                message: message,
                accountTypes: searchAccountTypesResult.data
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * 取引確認
 */
transactionsRouter.all(
    '/:transactionId/confirm',
    async (req, res, next) => {
        try {
            let message;
            let fromAccount: pecorinoapi.factory.account.IAccount | undefined;
            let toAccount: pecorinoapi.factory.account.IAccount | undefined;
            const transaction = (<Express.Session>req.session)[`transaction:${req.params.transactionId}`];
            if (transaction === undefined) {
                throw new pecorinoapi.factory.errors.NotFound('Transaction in session');
            }

            if (req.method === 'POST') {
                // 確定
                switch (transaction.typeOf) {
                    case pecorinoapi.factory.transactionType.Deposit:
                        const depositService = new pecorinoapi.service.transaction.Deposit({
                            endpoint: <string>process.env.API_ENDPOINT,
                            auth: req.user.authClient
                        });
                        await depositService.confirm(transaction);

                        break;

                    case pecorinoapi.factory.transactionType.Transfer:
                        const transferService = new pecorinoapi.service.transaction.Transfer({
                            endpoint: <string>process.env.API_ENDPOINT,
                            auth: req.user.authClient
                        });
                        await transferService.confirm(transaction);

                        break;

                    case pecorinoapi.factory.transactionType.Withdraw:
                        const withdrawService = new pecorinoapi.service.transaction.Withdraw({
                            endpoint: <string>process.env.API_ENDPOINT,
                            auth: req.user.authClient
                        });
                        await withdrawService.confirm(transaction);

                        break;

                    default:
                        throw new Error(`Transaction type ${req.body.transactionType} not implemented`);
                }

                debug('取引確定です。');
                message = '取引を実行しました。';
                // セッション削除
                delete (<Express.Session>req.session)[`transaction:${req.params.transactionId}`];
                req.flash('message', '取引を実行しました。');
                res.redirect(`/projects/${req.project.id}/transactions/start`);

                return;
            } else {
                // 転送元、転送先口座情報を検索
                const accountService = new pecorinoapi.service.Account({
                    endpoint: <string>process.env.API_ENDPOINT,
                    auth: req.user.authClient
                });
                if (transaction.object.fromLocation !== undefined) {
                    const searchAccountsResult = await accountService.search({
                        accountNumbers: [transaction.object.fromLocation.accountNumber],
                        statuses: [],
                        limit: 1
                    });
                    fromAccount = searchAccountsResult.data.shift();
                }

                if (transaction.object.toLocation !== undefined) {
                    const searchAccountsResult = await accountService.search({
                        accountNumbers: [transaction.object.toLocation.accountNumber],
                        statuses: [],
                        limit: 1
                    });
                    toAccount = searchAccountsResult.data.shift();
                    if (toAccount === undefined) {
                        throw new Error('To Location Not Found');
                    }
                }
            }

            res.render('transactions/confirm', {
                transaction: transaction,
                message: message,
                fromAccount: fromAccount,
                toAccount: toAccount
            });
        } catch (error) {
            next(error);
        }
    }
);

// tslint:disable-next-line:max-func-body-length
function createStartParams(
    req: express.Request
): pecorinoapi.factory.transaction.deposit.IStartParamsWithoutDetail
    | pecorinoapi.factory.transaction.transfer.IStartParamsWithoutDetail
    | pecorinoapi.factory.transaction.withdraw.IStartParamsWithoutDetail {

    const expires = moment().add(1, 'minutes').toDate();
    const agent = {
        typeOf: 'Person',
        id: req.user.profile.sub,
        name: req.body.fromName
    };
    const recipient = {
        typeOf: 'Person',
        id: '',
        name: req.body.recipientName
    };
    const amount = Number(req.body.amount);
    const description = req.body.description;

    let startParams: pecorinoapi.factory.transaction.deposit.IStartParamsWithoutDetail
        | pecorinoapi.factory.transaction.transfer.IStartParamsWithoutDetail
        | pecorinoapi.factory.transaction.withdraw.IStartParamsWithoutDetail;

    switch (req.body.transactionType) {
        case pecorinoapi.factory.transactionType.Deposit:
            startParams = {
                project: req.project,
                typeOf: pecorinoapi.factory.transactionType.Deposit,
                expires,
                agent,
                recipient,
                object: {
                    amount,
                    toLocation: {
                        accountNumber: req.body.toAccountNumber
                    },
                    description
                }
            };

            break;

        case pecorinoapi.factory.transactionType.Transfer:
            startParams = {
                project: req.project,
                typeOf: pecorinoapi.factory.transactionType.Transfer,
                expires,
                agent,
                recipient,
                object: {
                    amount,
                    fromLocation: {
                        accountNumber: req.body.fromAccountNumber
                    },
                    toLocation: {
                        accountNumber: req.body.toAccountNumber
                    },
                    description
                }
            };

            break;

        case pecorinoapi.factory.transactionType.Withdraw:
            startParams = {
                project: req.project,
                typeOf: pecorinoapi.factory.transactionType.Withdraw,
                expires,
                agent,
                recipient,
                object: {
                    amount,
                    fromLocation: {
                        accountNumber: req.body.fromAccountNumber
                    },
                    description
                }
            };

            break;

        default:
            throw new Error(`Transaction type ${req.body.transactionType} not implemented`);
    }

    return <any>startParams;
}

export default transactionsRouter;
