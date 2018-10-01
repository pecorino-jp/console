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
 */
const pecorinoapi = require("@pecorino/api-nodejs-client");
const createDebug = require("debug");
const express = require("express");
const debug = createDebug('pecorino-console:routes:account');
const accountsRouter = express.Router();
/**
 * 口座検索
 */
accountsRouter.get('/', 
// tslint:disable-next-line:cyclomatic-complexity
(req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const accountService = new pecorinoapi.service.Account({
            endpoint: process.env.PECORINO_API_ENDPOINT,
            auth: req.user.authClient
        });
        const searchConditions = {
            limit: req.query.limit,
            page: req.query.page,
            accountType: req.query.accountType,
            accountNumbers: (typeof req.query.accountNumber === 'string' && req.query.accountNumber.length > 0) ?
                [req.query.accountNumber] :
                [],
            statuses: [],
            name: req.query.name
        };
        if (req.query.format === 'datatable') {
            debug('searching accounts...', req.query);
            const accounts = yield accountService.search(searchConditions);
            res.json({
                draw: req.query.draw,
                recordsTotal: 100,
                recordsFiltered: accounts.length,
                data: accounts
            });
        }
        else {
            res.render('accounts/index', {
                query: req.query
            });
        }
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 口座詳細
 */
accountsRouter.get('/:accountType/:accountNumber', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const accountService = new pecorinoapi.service.Account({
            endpoint: process.env.PECORINO_API_ENDPOINT,
            auth: req.user.authClient
        });
        const searchAccountsResult = yield accountService.search({
            limit: 1,
            statuses: [],
            accountType: req.params.accountType,
            accountNumbers: [req.params.accountNumber]
        });
        const account = searchAccountsResult[0];
        if (account === undefined) {
            throw new pecorinoapi.factory.errors.NotFound('Account');
        }
        res.render('accounts/show', {
            message: '',
            account: account
        });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 取引検索
 */
accountsRouter.get('/:accountType/:accountNumber/actions/moneyTransfer', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const accountService = new pecorinoapi.service.Account({
            endpoint: process.env.PECORINO_API_ENDPOINT,
            auth: req.user.authClient
        });
        const actions = yield accountService.searchMoneyTransferActions({
            limit: req.query.limit,
            page: req.query.page,
            accountType: req.params.accountType,
            accountNumber: req.params.accountNumber,
            sort: {
                endDate: -1
            }
        });
        res.json({
            totalCount: 100,
            data: actions
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = accountsRouter;
