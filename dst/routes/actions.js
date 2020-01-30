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
const pecorinoapi = require("@pecorino/api-nodejs-client");
const createDebug = require("debug");
const express = require("express");
const debug = createDebug('pecorino-console:router');
const actionsRouter = express.Router();
/**
 * 転送アクション検索
 */
actionsRouter.get('/moneyTransfer', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const actionService = new pecorinoapi.service.Action({
            endpoint: process.env.API_ENDPOINT,
            auth: req.user.authClient
        });
        const searchConditions = {
            limit: req.query.limit,
            page: req.query.page,
            sort: { startDate: pecorinoapi.factory.sortType.Descending },
            project: { id: { $eq: req.project.id } },
            accountType: req.query.accountType,
            accountNumber: (typeof req.query.accountNumber === 'string' && req.query.accountNumber.length > 0) ?
                req.query.accountNumber :
                undefined
        };
        if (req.query.format === 'datatable') {
            debug('searching accounts...', req.query);
            const { data } = yield actionService.searchMoneyTransferActions(searchConditions);
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
            res.render('actions/moneyTransfer/index', {
                query: req.query
            });
        }
    }
    catch (error) {
        next(error);
    }
}));
exports.default = actionsRouter;
