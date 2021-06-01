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
 * 口座ルーター
 */
const chevreapi = require("@chevre/api-nodejs-client");
const createDebug = require("debug");
const express = require("express");
const http_status_1 = require("http-status");
const moment = require("moment");
const debug = createDebug('pecorino-console:router');
const accountsRouter = express.Router();
/**
 * 口座検索
 */
accountsRouter.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accountService = new chevreapi.service.Account({
            endpoint: process.env.CHEVRE_API_ENDPOINT,
            auth: req.user.authClient,
            project: { id: req.project.id }
        });
        const searchConditions = {
            limit: req.query.limit,
            page: req.query.page,
            sort: { openDate: chevreapi.factory.sortType.Descending },
            project: { id: { $eq: req.project.id } },
            accountType: (typeof req.query.accountType === 'string' && req.query.accountType.length > 0)
                ? req.query.accountType
                : undefined,
            statuses: (typeof req.query.status === 'string' && req.query.status.length > 0)
                ? [req.query.status]
                : undefined,
            accountNumber: {
                $regex: (typeof req.query.accountNumber === 'string' && req.query.accountNumber.length > 0)
                    ? req.query.accountNumber
                    : undefined
            },
            name: {
                $regex: (typeof req.query.name === 'string' && req.query.name.length > 0) ? req.query.name : undefined
            },
            typeOf: {
                $eq: (typeof req.query.typeOf === 'string' && req.query.typeOf.length > 0)
                    ? req.query.typeOf
                    : undefined
            }
        };
        if (req.query.format === 'datatable') {
            debug('searching accounts...', req.query);
            const { data } = yield accountService.search(searchConditions);
            res.json({
                draw: req.query.draw,
                // recordsTotal: data.length,
                recordsFiltered: (data.length === Number(searchConditions.limit))
                    ? (Number(searchConditions.page) * Number(searchConditions.limit)) + 1
                    : ((Number(searchConditions.page) - 1) * Number(searchConditions.limit)) + Number(data.length),
                data: data
            });
        }
        else {
            const categoryCodeService = new chevreapi.service.CategoryCode({
                endpoint: process.env.CHEVRE_API_ENDPOINT,
                auth: req.user.authClient,
                project: { id: req.project.id }
            });
            const searchAccountTypesResult = yield categoryCodeService.search({
                project: { id: { $eq: req.project.id } },
                inCodeSet: { identifier: { $eq: chevreapi.factory.categoryCode.CategorySetIdentifier.AccountType } }
            });
            const productService = new chevreapi.service.Product({
                endpoint: process.env.CHEVRE_API_ENDPOINT,
                auth: req.user.authClient,
                project: { id: req.project.id }
            });
            const searchPaymentCardsResult = yield productService.search({
                project: { id: { $eq: req.project.id } },
                typeOf: {
                    $in: [
                        chevreapi.factory.product.ProductType.PaymentCard
                    ]
                }
            });
            res.render('accounts/index', {
                query: req.query,
                accountTypes: searchAccountTypesResult.data,
                paymentCards: searchPaymentCardsResult.data
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
accountsRouter.all('/:accountNumber', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let message;
        const accountService = new chevreapi.service.Account({
            endpoint: process.env.CHEVRE_API_ENDPOINT,
            auth: req.user.authClient,
            project: { id: req.project.id }
        });
        const { data } = yield accountService.search({
            limit: 1,
            project: { id: { $eq: req.project.id } },
            accountNumbers: [req.params.accountNumber]
        });
        if (data.length < 1) {
            throw new chevreapi.factory.errors.NotFound('Account');
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
accountsRouter.get('/:accountNumber/actions/moneyTransfer', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accountService = new chevreapi.service.Account({
            endpoint: process.env.CHEVRE_API_ENDPOINT,
            auth: req.user.authClient,
            project: { id: req.project.id }
        });
        const searchActionsResult = yield accountService.searchMoneyTransferActions({
            limit: req.query.limit,
            page: req.query.page,
            sort: { startDate: chevreapi.factory.sortType.Descending },
            project: { id: { $eq: req.project.id } },
            accountNumber: req.params.accountNumber,
            startDate: {
                $gte: moment()
                    .add(-1, 'month')
                    .toDate()
            }
        });
        res.json(searchActionsResult);
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 口座詳細
 * @deprecated Use /:accountNumber
 */
accountsRouter.get('/:accountType/:accountNumber', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.redirect(`/projects/${req.project.id}/accounts/${req.params.accountNumber}`);
    }
    catch (error) {
        next(error);
    }
}));
exports.default = accountsRouter;
