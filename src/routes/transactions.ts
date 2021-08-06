/**
 * 取引ルーター
 */
import { chevre as chevreapi } from '@cinerino/sdk';
import * as createDebug from 'debug';
import * as express from 'express';
import * as moment from 'moment';

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
                    let transaction: chevreapi.factory.account.transaction.ITransaction<chevreapi.factory.account.transactionType>;

                    switch (req.body.transactionType) {
                        case chevreapi.factory.account.transactionType.Deposit:
                            const depositService = new chevreapi.service.accountTransaction.Deposit({
                                endpoint: <string>process.env.CHEVRE_API_ENDPOINT,
                                auth: req.user.authClient,
                                project: { id: req.project.id }
                            });
                            transaction = await depositService.start(
                                <chevreapi.factory.account.transaction.deposit.IStartParamsWithoutDetail>createStartParams(req)
                            );

                            break;

                        case chevreapi.factory.account.transactionType.Transfer:
                            const transferService = new chevreapi.service.accountTransaction.Transfer({
                                endpoint: <string>process.env.CHEVRE_API_ENDPOINT,
                                auth: req.user.authClient,
                                project: { id: req.project.id }
                            });
                            transaction = await transferService.start(
                                <chevreapi.factory.account.transaction.transfer.IStartParamsWithoutDetail>createStartParams(req)
                            );

                            break;

                        case chevreapi.factory.account.transactionType.Withdraw:
                            const withdrawService = new chevreapi.service.accountTransaction.Withdraw({
                                endpoint: <string>process.env.CHEVRE_API_ENDPOINT,
                                auth: req.user.authClient,
                                project: { id: req.project.id }
                            });
                            transaction = await withdrawService.start(
                                <chevreapi.factory.account.transaction.withdraw.IStartParamsWithoutDetail>createStartParams(req)
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

            res.render('transactions/start', {
                values: values,
                message: message
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
            let fromAccount: chevreapi.factory.account.IAccount | undefined;
            let toAccount: chevreapi.factory.account.IAccount | undefined;
            const transaction = (<Express.Session>req.session)[`transaction:${req.params.transactionId}`];
            if (transaction === undefined) {
                throw new chevreapi.factory.errors.NotFound('Transaction in session');
            }

            if (req.method === 'POST') {
                // 確定
                switch (transaction.typeOf) {
                    case chevreapi.factory.account.transactionType.Deposit:
                        const depositService = new chevreapi.service.accountTransaction.Deposit({
                            endpoint: <string>process.env.CHEVRE_API_ENDPOINT,
                            auth: req.user.authClient,
                            project: { id: req.project.id }
                        });
                        await depositService.confirm(transaction);

                        break;

                    case chevreapi.factory.account.transactionType.Transfer:
                        const transferService = new chevreapi.service.accountTransaction.Transfer({
                            endpoint: <string>process.env.CHEVRE_API_ENDPOINT,
                            auth: req.user.authClient,
                            project: { id: req.project.id }
                        });
                        await transferService.confirm(transaction);

                        break;

                    case chevreapi.factory.account.transactionType.Withdraw:
                        const withdrawService = new chevreapi.service.accountTransaction.Withdraw({
                            endpoint: <string>process.env.CHEVRE_API_ENDPOINT,
                            auth: req.user.authClient,
                            project: { id: req.project.id }
                        });
                        await withdrawService.confirm(transaction);

                        break;

                    default:
                        throw new Error(`Transaction type ${req.body.transactionType} not implemented`);
                }

                debug('取引確定です。');
                message = '取引を実行しました。';
                // セッション削除
                // tslint:disable-next-line:no-dynamic-delete
                delete (<Express.Session>req.session)[`transaction:${req.params.transactionId}`];
                req.flash('message', '取引を実行しました。');
                res.redirect(`/projects/${req.project.id}/transactions/start`);

                return;
            } else {
                // 転送元、転送先口座情報を検索
                const accountService = new chevreapi.service.Account({
                    endpoint: <string>process.env.CHEVRE_API_ENDPOINT,
                    auth: req.user.authClient,
                    project: { id: req.project.id }
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
): chevreapi.factory.account.transaction.deposit.IStartParamsWithoutDetail
    | chevreapi.factory.account.transaction.transfer.IStartParamsWithoutDetail
    | chevreapi.factory.account.transaction.withdraw.IStartParamsWithoutDetail {

    const expires = moment()
        .add(1, 'minutes')
        .toDate();
    const agent = {
        typeOf: chevreapi.factory.personType.Person,
        id: req.user.profile.sub,
        name: req.body.fromName
    };
    const recipient = {
        typeOf: chevreapi.factory.personType.Person,
        id: '',
        name: req.body.recipientName
    };
    const amount = { value: Number(req.body.amount) };
    const description = req.body.description;

    let startParams: chevreapi.factory.account.transaction.deposit.IStartParamsWithoutDetail
        | chevreapi.factory.account.transaction.transfer.IStartParamsWithoutDetail
        | chevreapi.factory.account.transaction.withdraw.IStartParamsWithoutDetail;

    switch (req.body.transactionType) {
        case chevreapi.factory.account.transactionType.Deposit:
            startParams = {
                project: req.project,
                typeOf: chevreapi.factory.account.transactionType.Deposit,
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

        case chevreapi.factory.account.transactionType.Transfer:
            startParams = {
                project: req.project,
                typeOf: chevreapi.factory.account.transactionType.Transfer,
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

        case chevreapi.factory.account.transactionType.Withdraw:
            startParams = {
                project: req.project,
                typeOf: chevreapi.factory.account.transactionType.Withdraw,
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

    return startParams;
}

export default transactionsRouter;
