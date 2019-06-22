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
const http_status_1 = require("http-status");
const debug = createDebug('pecorino-console:router');
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
            sort: { openDate: pecorinoapi.factory.sortType.Descending },
            accountType: req.query.accountType,
            accountNumbers: (typeof req.query.accountNumber === 'string' && req.query.accountNumber.length > 0) ?
                [req.query.accountNumber] :
                [],
            statuses: [],
            name: req.query.name
        };
        if (req.query.format === 'datatable') {
            debug('searching accounts...', req.query);
            const { totalCount, data } = yield accountService.searchWithTotalCount(searchConditions);
            res.json({
                draw: req.query.draw,
                recordsTotal: totalCount,
                recordsFiltered: totalCount,
                data: data
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
accountsRouter.all('/:accountType/:accountNumber', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        let message;
        const accountService = new pecorinoapi.service.Account({
            endpoint: process.env.PECORINO_API_ENDPOINT,
            auth: req.user.authClient
        });
        const { totalCount, data } = yield accountService.searchWithTotalCount({
            limit: 1,
            statuses: [],
            accountType: req.params.accountType,
            accountNumbers: [req.params.accountNumber]
        });
        if (totalCount < 1) {
            throw new pecorinoapi.factory.errors.NotFound('Account');
        }
        const account = data[0];
        if (req.method === 'DELETE') {
            res.status(http_status_1.NO_CONTENT)
                .end();
            return;
        }
        else if (req.method === 'POST') {
            try {
                yield accountService.update({
                    accountType: req.params.accountType,
                    accountNumber: req.params.accountNumber,
                    name: req.body.name
                });
                req.flash('message', '更新しました');
                res.redirect(req.originalUrl);
                return;
            }
            catch (error) {
                message = error.message;
            }
        }
        res.render('accounts/show', {
            message: message,
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
        const searchActionsResult = yield accountService.searchMoneyTransferActionsWithTotalCount({
            limit: req.query.limit,
            page: req.query.page,
            accountType: req.params.accountType,
            accountNumber: req.params.accountNumber,
            sort: { startDate: pecorinoapi.factory.sortType.Descending }
        });
        res.json(searchActionsResult);
    }
    catch (error) {
        next(error);
    }
}));
exports.default = accountsRouter;
