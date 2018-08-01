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
 * 口座ルーター
 * @ignore
 */
const pecorinoapi = require("@pecorino/api-nodejs-client");
const createDebug = require("debug");
const express = require("express");
const debug = createDebug('pecorino-console:routes:account');
const accountsRouter = express.Router();
/**
 * 口座検索
 */
accountsRouter.get('/', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const accountService = new pecorinoapi.service.Account({
            endpoint: process.env.PECORINO_API_ENDPOINT,
            auth: req.user.authClient
        });
        debug('searching accounts...', req.query);
        const accounts = yield accountService.search({
            accountType: req.query.accountType,
            accountNumbers: (typeof req.query.accountNumber === 'string' && req.query.accountNumber.length > 0) ?
                [req.query.accountNumber] :
                [],
            statuses: [],
            name: req.query.name,
            limit: 100
        });
        res.render('accounts/index', {
            query: req.query,
            accounts: accounts
        });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 口座に対する転送アクション検索
 */
accountsRouter.get('/:accountType/:accountNumber/actions/MoneyTransfer', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const accountService = new pecorinoapi.service.Account({
            endpoint: process.env.PECORINO_API_ENDPOINT,
            auth: req.user.authClient
        });
        const actions = yield accountService.searchMoneyTransferActions({
            accountType: req.params.accountType,
            accountNumber: req.params.accountNumber
        });
        res.render('accounts/actions/moneyTransfer', {
            accountType: req.params.accountType,
            accountNumber: req.params.accountNumber,
            actions: actions
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = accountsRouter;
