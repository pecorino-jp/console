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
const pecorinoapi = require("@motionpicture/pecorino-api-nodejs-client");
const express = require("express");
const accountsRouter = express.Router();
const authClient = new pecorinoapi.auth.ClientCredentials({
    domain: process.env.PECORINO_API_AUTHORIZE_SERVER_DOMAIN,
    clientId: process.env.PECORINO_API_CLIENT_ID,
    clientSecret: process.env.PECORINO_API_CLIENT_SECRET,
    scopes: [],
    state: ''
});
const accountService = new pecorinoapi.service.Account({
    endpoint: process.env.PECORINO_API_ENDPOINT,
    auth: authClient
});
/**
 * 口座検索
 */
accountsRouter.get('/', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const accounts = yield accountService.search(req.query);
        res.render('accounts/index', { accounts: accounts });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * 口座に対する転送アクション検索
 */
accountsRouter.get('/:accountNumber/actions/MoneyTransfer', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const actions = yield accountService.searchMoneyTransferActions({ accountNumber: req.params.accountNumber });
        res.render('accounts/actions/moneyTransfer', {
            accountNumber: req.params.accountNumber,
            actions: actions
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = accountsRouter;
