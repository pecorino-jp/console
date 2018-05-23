"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 取引ルーター
 * @ignore
 */
const pecorinoapi = require("@motionpicture/pecorino-api-nodejs-client");
const createDebug = require("debug");
const express = require("express");
const moment = require("moment");
const debug = createDebug('pecorino-console:routes:account');
const transactionsRouter = express.Router();
/**
 * 取引検索
 */
transactionsRouter.get('/', (req, _, next) => __awaiter(this, void 0, void 0, function* () {
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
transactionsRouter.all('/deposit/start', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        let values = {};
        let message;
        if (req.method === 'POST') {
            values = req.body;
            try {
                const depositTransactionService = new pecorinoapi.service.transaction.Deposit({
                    endpoint: process.env.PECORINO_API_ENDPOINT,
                    auth: req.user.authClient
                });
                debug('取引が開始します...', values);
                const transaction = yield depositTransactionService.start({
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
                req.session[`transaction:${transaction.id}`] = transaction;
                res.redirect(`/transactions/deposit/${transaction.id}/confirm`);
                return;
            }
            catch (error) {
                message = error.message;
            }
        }
        res.render('transactions/deposit/start', {
            values: values,
            message: message
        });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 入金取引確認
 */
transactionsRouter.all('/deposit/:transactionId/confirm', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        let message;
        const transaction = req.session[`transaction:${req.params.transactionId}`];
        if (transaction === undefined) {
            throw new pecorinoapi.factory.errors.NotFound('Transaction in session');
        }
        if (req.method === 'POST') {
            // 確定
            const depositTransactionService = new pecorinoapi.service.transaction.Deposit({
                endpoint: process.env.PECORINO_API_ENDPOINT,
                auth: req.user.authClient
            });
            yield depositTransactionService.confirm({
                transactionId: transaction.id
            });
            debug('取引確定です。');
            message = '入金取引を実行しました。';
            // セッション削除
            delete req.session[`transaction:${req.params.transactionId}`];
            req.flash('message', '入金取引を実行しました。');
            res.redirect('/transactions/deposit/start');
            return;
        }
        res.render('transactions/deposit/confirm', {
            transaction: transaction,
            message: message
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = transactionsRouter;
