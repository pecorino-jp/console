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
// import * as createDebug from 'debug';
const express = require("express");
// import * as moment from 'moment';
const cinerinoapi = require("../cinerinoapi");
// const debug = createDebug('cinerino-console:routes');
const dashboardRouter = express.Router();
dashboardRouter.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const projectService = new cinerinoapi.service.Project({
            endpoint: process.env.CINERINO_API_ENDPOINT,
            auth: req.user.authClient
        });
        const searchProjectsResult = yield projectService.search({});
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
