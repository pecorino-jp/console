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
 * アクションルーター
 */
const sdk_1 = require("@cinerino/sdk");
const createDebug = require("debug");
const express = require("express");
const debug = createDebug('pecorino-console:router');
const actionsRouter = express.Router();
/**
 * 出入金検索
 */
actionsRouter.get('/moneyTransfer', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const actionService = new sdk_1.chevre.service.AccountAction({
            endpoint: process.env.CHEVRE_API_ENDPOINT,
            auth: req.user.authClient,
            project: { id: req.project.id }
        });
        const actionStatusEq = req.query.actionStatus;
        const purposeTypeOfEq = (_a = req.query.purpose) === null || _a === void 0 ? void 0 : _a.typeOf;
        const purposeIdEq = (_b = req.query.purpose) === null || _b === void 0 ? void 0 : _b.id;
        const searchConditions = {
            limit: req.query.limit,
            page: req.query.page,
            sort: { startDate: sdk_1.chevre.factory.sortType.Descending },
            project: { id: { $eq: req.project.id } },
            actionStatus: {
                $in: (typeof actionStatusEq === 'string' && actionStatusEq.length > 0)
                    ? [actionStatusEq]
                    : undefined
            },
            amount: {
                currency: {
                    $eq: (typeof req.query.accountType === 'string' && req.query.accountType.length > 0)
                        ? req.query.accountType
                        : undefined
                }
            },
            location: {
                accountNumber: {
                    $eq: (typeof req.query.accountNumber === 'string' && req.query.accountNumber.length > 0)
                        ? req.query.accountNumber
                        : undefined
                },
                typeOf: {
                    $eq: (typeof ((_c = req.query.location) === null || _c === void 0 ? void 0 : _c.typeOf) === 'string' && req.query.location.typeOf.length > 0)
                        ? req.query.location.typeOf
                        : undefined
                }
            },
            purpose: {
                typeOf: { $eq: (typeof purposeTypeOfEq === 'string' && purposeTypeOfEq.length > 0) ? purposeTypeOfEq : undefined },
                id: { $eq: (typeof purposeIdEq === 'string' && purposeIdEq.length > 0) ? purposeIdEq : undefined },
                identifier: {
                    $eq: (typeof ((_d = req.query.purpose) === null || _d === void 0 ? void 0 : _d.identifier) === 'string'
                        && req.query.purpose.identifier.length > 0) ? req.query.purpose.identifier : undefined
                }
            }
        };
        if (req.query.format === 'datatable') {
            debug('searching accounts...', req.query);
            const { data } = yield actionService.search(searchConditions);
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
            const categoryCodeService = new sdk_1.chevre.service.CategoryCode({
                endpoint: process.env.CHEVRE_API_ENDPOINT,
                auth: req.user.authClient,
                project: { id: req.project.id }
            });
            const searchAccountTypesResult = yield categoryCodeService.search({
                project: { id: { $eq: req.project.id } },
                inCodeSet: { identifier: { $eq: sdk_1.chevre.factory.categoryCode.CategorySetIdentifier.CurrencyType } }
            });
            res.render('actions/moneyTransfer/index', {
                query: req.query,
                accountTypes: searchAccountTypesResult.data
            });
        }
    }
    catch (error) {
        next(error);
    }
}));
exports.default = actionsRouter;
