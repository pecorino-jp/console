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
 * ダッシュボードルーター
 */
const sdk_1 = require("@cinerino/sdk");
const express = require("express");
const dashboardRouter = express.Router();
dashboardRouter.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 管理プロジェクト検索
        const meService = new sdk_1.chevre.service.Me({
            endpoint: process.env.CHEVRE_API_ENDPOINT,
            auth: req.user.authClient,
            project: { id: '' }
        });
        const searchProjectsResult = yield meService.searchProjects({ limit: 100 });
        const projects = searchProjectsResult.data;
        res.render('dashboard', {
            layout: 'layouts/dashboard',
            message: 'Welcome to Pecorino Console!',
            projects: projects
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = dashboardRouter;
