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
 * 入金取引開始
 */
transactionsRouter.all('/deposit/start', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let values = {};
        let message;
        if (req.method === 'POST') {
            values = req.body;
            try {
                const depositTransactionService = new pecorinoapi.service.transaction.Deposit({
                    endpoint: process.env.API_ENDPOINT,
                    auth: req.user.authClient
                });
                const startParams = createStartParams(req);
                const transaction = yield depositTransactionService.start(startParams);
                // セッションに取引追加
                req.session[`transaction:${transaction.id}`] = transaction;
                res.redirect(`/projects/${req.project.id}/transactions/deposit/${transaction.id}/confirm`);
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
        res.render('transactions/deposit/start', {
            values: values,
            message: message,
            accountTypes: searchAccountTypesResult.data
        });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 入金取引確認
 */
transactionsRouter.all('/deposit/:transactionId/confirm', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let message;
        let toAccount;
        const transaction = req.session[`transaction:${req.params.transactionId}`];
        if (transaction === undefined) {
            throw new pecorinoapi.factory.errors.NotFound('Transaction in session');
        }
        if (req.method === 'POST') {
            // 確定
            const depositTransactionService = new pecorinoapi.service.transaction.Deposit({
                endpoint: process.env.API_ENDPOINT,
                auth: req.user.authClient
            });
            yield depositTransactionService.confirm(transaction);
            debug('取引確定です。');
            message = '入金取引を実行しました。';
            // セッション削除
            delete req.session[`transaction:${req.params.transactionId}`];
            req.flash('message', '入金取引を実行しました。');
            res.redirect(`/projects/${req.project.id}/transactions/deposit/start`);
            return;
        }
        else {
            // 入金先口座情報を検索
            const accountService = new pecorinoapi.service.Account({
                endpoint: process.env.API_ENDPOINT,
                auth: req.user.authClient
            });
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
        res.render('transactions/deposit/confirm', {
            transaction: transaction,
            message: message,
            toAccount: toAccount
        });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 出金取引開始
 */
transactionsRouter.all('/withdraw/start', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let values = {};
        let message;
        if (req.method === 'POST') {
            values = req.body;
            try {
                const withdrawService = new pecorinoapi.service.transaction.Withdraw({
                    endpoint: process.env.API_ENDPOINT,
                    auth: req.user.authClient
                });
                const startParams = createStartParams(req);
                const transaction = yield withdrawService.start(startParams);
                // セッションに取引追加
                req.session[`transaction:${transaction.id}`] = transaction;
                res.redirect(`/projects/${req.project.id}/transactions/withdraw/${transaction.id}/confirm`);
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
        res.render('transactions/withdraw/start', {
            values: values,
            message: message,
            accountTypes: searchAccountTypesResult.data
        });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 出金取引確認
 */
transactionsRouter.all('/withdraw/:transactionId/confirm', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let message;
        let fromAccount;
        const transaction = req.session[`transaction:${req.params.transactionId}`];
        if (transaction === undefined) {
            throw new pecorinoapi.factory.errors.NotFound('Transaction in session');
        }
        if (req.method === 'POST') {
            // 確定
            const withdrawService = new pecorinoapi.service.transaction.Withdraw({
                endpoint: process.env.API_ENDPOINT,
                auth: req.user.authClient
            });
            yield withdrawService.confirm(transaction);
            debug('取引確定です。');
            message = '出金取引を実行しました。';
            // セッション削除
            delete req.session[`transaction:${req.params.transactionId}`];
            req.flash('message', '出金取引を実行しました。');
            res.redirect(`/projects/${req.project.id}/transactions/withdraw/start`);
            return;
        }
        else {
            // 入金先口座情報を検索
            const accountService = new pecorinoapi.service.Account({
                endpoint: process.env.API_ENDPOINT,
                auth: req.user.authClient
            });
            const searchAccountsResult = yield accountService.search({
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
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 転送取引開始
 */
transactionsRouter.all('/transfer/start', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let values = {};
        let message;
        if (req.method === 'POST') {
            values = req.body;
            try {
                const transferService = new pecorinoapi.service.transaction.Transfer({
                    endpoint: process.env.API_ENDPOINT,
                    auth: req.user.authClient
                });
                const startParams = createStartParams(req);
                const transaction = yield transferService.start(startParams);
                // セッションに取引追加
                req.session[`transaction:${transaction.id}`] = transaction;
                res.redirect(`/projects/${req.project.id}/transactions/transfer/${transaction.id}/confirm`);
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
        res.render('transactions/transfer/start', {
            values: values,
            message: message,
            accountTypes: searchAccountTypesResult.data
        });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 転送取引確認
 */
transactionsRouter.all('/transfer/:transactionId/confirm', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
            const transferService = new pecorinoapi.service.transaction.Transfer({
                endpoint: process.env.API_ENDPOINT,
                auth: req.user.authClient
            });
            yield transferService.confirm(transaction);
            debug('取引確定です。');
            message = '転送取引を実行しました。';
            // セッション削除
            delete req.session[`transaction:${req.params.transactionId}`];
            req.flash('message', '転送取引を実行しました。');
            res.redirect(`/projects/${req.project.id}/transactions/transfer/start`);
            return;
        }
        else {
            // 転送元、転送先口座情報を検索
            const accountService = new pecorinoapi.service.Account({
                endpoint: process.env.API_ENDPOINT,
                auth: req.user.authClient
            });
            let searchAccountsResult = yield accountService.search({
                accountType: transaction.object.fromLocation.accountType,
                accountNumbers: [transaction.object.fromLocation.accountNumber],
                statuses: [],
                limit: 1
            });
            fromAccount = searchAccountsResult.data.shift();
            searchAccountsResult = yield accountService.search({
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
