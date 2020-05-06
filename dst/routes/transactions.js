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
const pecorinoapi = require("@pecorino/api-nodejs-client");
const createDebug = require("debug");
const express = require("express");
const moment = require("moment");
const chevreapi = require("../chevreapi");
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
                    case pecorinoapi.factory.transactionType.Deposit:
                        const depositService = new pecorinoapi.service.transaction.Deposit({
                            endpoint: process.env.API_ENDPOINT,
                            auth: req.user.authClient
                        });
                        transaction = yield depositService.start(createStartParams(req));
                        break;
                    case pecorinoapi.factory.transactionType.Transfer:
                        const transferService = new pecorinoapi.service.transaction.Transfer({
                            endpoint: process.env.API_ENDPOINT,
                            auth: req.user.authClient
                        });
                        transaction = yield transferService.start(createStartParams(req));
                        break;
                    case pecorinoapi.factory.transactionType.Withdraw:
                        const withdrawService = new pecorinoapi.service.transaction.Withdraw({
                            endpoint: process.env.API_ENDPOINT,
                            auth: req.user.authClient
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
        const categoryCodeService = new chevreapi.service.CategoryCode({
            endpoint: process.env.CHEVRE_API_ENDPOINT,
            auth: req.user.authClient
        });
        const searchAccountTypesResult = yield categoryCodeService.search({
            project: { id: { $eq: req.project.id } },
            inCodeSet: { identifier: { $eq: chevreapi.factory.categoryCode.CategorySetIdentifier.AccountType } }
        });
        const productService = new chevreapi.service.Product({
            endpoint: process.env.CHEVRE_API_ENDPOINT,
            auth: req.user.authClient
        });
        const searchPaymentCardsResult = yield productService.search({
            project: { id: { $eq: req.project.id } },
            typeOf: { $eq: 'PaymentCard' }
        });
        res.render('transactions/start', {
            values: values,
            message: message,
            accountTypes: searchAccountTypesResult.data,
            paymentCards: searchPaymentCardsResult.data
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
            throw new pecorinoapi.factory.errors.NotFound('Transaction in session');
        }
        if (req.method === 'POST') {
            // 確定
            switch (transaction.typeOf) {
                case pecorinoapi.factory.transactionType.Deposit:
                    const depositService = new pecorinoapi.service.transaction.Deposit({
                        endpoint: process.env.API_ENDPOINT,
                        auth: req.user.authClient
                    });
                    yield depositService.confirm(transaction);
                    break;
                case pecorinoapi.factory.transactionType.Transfer:
                    const transferService = new pecorinoapi.service.transaction.Transfer({
                        endpoint: process.env.API_ENDPOINT,
                        auth: req.user.authClient
                    });
                    yield transferService.confirm(transaction);
                    break;
                case pecorinoapi.factory.transactionType.Withdraw:
                    const withdrawService = new pecorinoapi.service.transaction.Withdraw({
                        endpoint: process.env.API_ENDPOINT,
                        auth: req.user.authClient
                    });
                    yield withdrawService.confirm(transaction);
                    break;
                default:
                    throw new Error(`Transaction type ${req.body.transactionType} not implemented`);
            }
            debug('取引確定です。');
            message = '取引を実行しました。';
            // セッション削除
            delete req.session[`transaction:${req.params.transactionId}`];
            req.flash('message', '取引を実行しました。');
            res.redirect(`/projects/${req.project.id}/transactions/start`);
            return;
        }
        else {
            // 転送元、転送先口座情報を検索
            const accountService = new pecorinoapi.service.Account({
                endpoint: process.env.API_ENDPOINT,
                auth: req.user.authClient
            });
            if (transaction.object.fromLocation !== undefined) {
                const searchAccountsResult = yield accountService.search({
                    accountType: transaction.object.fromLocation.accountType,
                    accountNumbers: [transaction.object.fromLocation.accountNumber],
                    statuses: [],
                    limit: 1
                });
                fromAccount = searchAccountsResult.data.shift();
            }
            if (transaction.object.toLocation !== undefined) {
                const searchAccountsResult = yield accountService.search({
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
    let startParams;
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
                        typeOf: pecorinoapi.factory.account.TypeOf.Account,
                        accountType: req.body.accountType,
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
                        typeOf: pecorinoapi.factory.account.TypeOf.Account,
                        accountType: req.body.accountType,
                        accountNumber: req.body.fromAccountNumber
                    },
                    toLocation: {
                        typeOf: pecorinoapi.factory.account.TypeOf.Account,
                        accountType: req.body.accountType,
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
                        typeOf: pecorinoapi.factory.account.TypeOf.Account,
                        accountType: req.body.accountType,
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
