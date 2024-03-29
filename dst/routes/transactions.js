"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 取引ルーター
 */
const sdk_1 = require("@cinerino/sdk");
const createDebug = require("debug");
const express = require("express");
const moment = require("moment");
const debug = createDebug('pecorino-console:router');
const transactionsRouter = express.Router();
/**
 * 取引検索
 */
transactionsRouter.get('/', (req, _, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        debug('searching transactions...', req.query);
        throw new Error('Not implemented');
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 取引開始
 */
transactionsRouter.all('/start', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let values = {};
        let message = '';
        if (req.method === 'POST') {
            values = req.body;
            try {
                let transaction;
                switch (req.body.transactionType) {
                    case sdk_1.chevre.factory.account.transactionType.Deposit:
                        const depositService = new sdk_1.chevre.service.accountTransaction.Deposit({
                            endpoint: process.env.CHEVRE_API_ENDPOINT,
                            auth: req.user.authClient,
                            project: { id: req.project.id }
                        });
                        transaction = yield depositService.start(createStartParams(req));
                        break;
                    case sdk_1.chevre.factory.account.transactionType.Transfer:
                        const transferService = new sdk_1.chevre.service.accountTransaction.Transfer({
                            endpoint: process.env.CHEVRE_API_ENDPOINT,
                            auth: req.user.authClient,
                            project: { id: req.project.id }
                        });
                        transaction = yield transferService.start(createStartParams(req));
                        break;
                    case sdk_1.chevre.factory.account.transactionType.Withdraw:
                        const withdrawService = new sdk_1.chevre.service.accountTransaction.Withdraw({
                            endpoint: process.env.CHEVRE_API_ENDPOINT,
                            auth: req.user.authClient,
                            project: { id: req.project.id }
                        });
                        transaction = yield withdrawService.start(createStartParams(req));
                        break;
                    default:
                        throw new Error(`Transaction type ${req.body.transactionType} not implemented`);
                }
                // セッションに取引追加
                req.session[`transaction:${transaction.id}`] = transaction;
                res.redirect(`/projects/${req.project.id}/transactions/${transaction.id}/confirm`);
                return;
            }
            catch (error) {
                message = error.message;
            }
        }
        res.render('transactions/start', {
            values: values,
            message: message
        });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 取引確認
 */
transactionsRouter.all('/:transactionId/confirm', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let message;
        let fromAccount;
        let toAccount;
        const transaction = req.session[`transaction:${req.params.transactionId}`];
        if (transaction === undefined) {
            throw new sdk_1.chevre.factory.errors.NotFound('Transaction in session');
        }
        if (req.method === 'POST') {
            // 確定
            switch (transaction.typeOf) {
                case sdk_1.chevre.factory.account.transactionType.Deposit:
                    const depositService = new sdk_1.chevre.service.accountTransaction.Deposit({
                        endpoint: process.env.CHEVRE_API_ENDPOINT,
                        auth: req.user.authClient,
                        project: { id: req.project.id }
                    });
                    yield depositService.confirm(transaction);
                    break;
                case sdk_1.chevre.factory.account.transactionType.Transfer:
                    const transferService = new sdk_1.chevre.service.accountTransaction.Transfer({
                        endpoint: process.env.CHEVRE_API_ENDPOINT,
                        auth: req.user.authClient,
                        project: { id: req.project.id }
                    });
                    yield transferService.confirm(transaction);
                    break;
                case sdk_1.chevre.factory.account.transactionType.Withdraw:
                    const withdrawService = new sdk_1.chevre.service.accountTransaction.Withdraw({
                        endpoint: process.env.CHEVRE_API_ENDPOINT,
                        auth: req.user.authClient,
                        project: { id: req.project.id }
                    });
                    yield withdrawService.confirm(transaction);
                    break;
                default:
                    throw new Error(`Transaction type ${req.body.transactionType} not implemented`);
            }
            debug('取引確定です。');
            message = '取引を実行しました。';
            // セッション削除
            // tslint:disable-next-line:no-dynamic-delete
            delete req.session[`transaction:${req.params.transactionId}`];
            req.flash('message', '取引を実行しました。');
            res.redirect(`/projects/${req.project.id}/transactions/start`);
            return;
        }
        else {
            // 転送元、転送先口座情報を検索
            const accountService = new sdk_1.chevre.service.Account({
                endpoint: process.env.CHEVRE_API_ENDPOINT,
                auth: req.user.authClient,
                project: { id: req.project.id }
            });
            if (transaction.object.fromLocation !== undefined) {
                const searchAccountsResult = yield accountService.search({
                    accountNumbers: [transaction.object.fromLocation.accountNumber],
                    statuses: [],
                    limit: 1
                });
                fromAccount = searchAccountsResult.data.shift();
            }
            if (transaction.object.toLocation !== undefined) {
                const searchAccountsResult = yield accountService.search({
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
    }
    catch (error) {
        next(error);
    }
}));
// tslint:disable-next-line:max-func-body-length
function createStartParams(req) {
    const expires = moment()
        .add(1, 'minutes')
        .toDate();
    const agent = {
        typeOf: sdk_1.chevre.factory.personType.Person,
        id: req.user.profile.sub,
        name: req.body.fromName
    };
    const recipient = {
        typeOf: sdk_1.chevre.factory.personType.Person,
        id: '',
        name: req.body.recipientName
    };
    const amount = { value: Number(req.body.amount) };
    const description = req.body.description;
    let startParams;
    switch (req.body.transactionType) {
        case sdk_1.chevre.factory.account.transactionType.Deposit:
            startParams = {
                project: req.project,
                typeOf: sdk_1.chevre.factory.account.transactionType.Deposit,
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
        case sdk_1.chevre.factory.account.transactionType.Transfer:
            startParams = {
                project: req.project,
                typeOf: sdk_1.chevre.factory.account.transactionType.Transfer,
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
        case sdk_1.chevre.factory.account.transactionType.Withdraw:
            startParams = {
                project: req.project,
                typeOf: sdk_1.chevre.factory.account.transactionType.Withdraw,
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
exports.default = transactionsRouter;
