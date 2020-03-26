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
 * プロジェクトルーター
 */
const express = require("express");
const cinerinoapi = require("../cinerinoapi");
const accounts_1 = require("./accounts");
const actions_1 = require("./actions");
const home_1 = require("./home");
const transactions_1 = require("./transactions");
const API_ENDPOINT = process.env.API_ENDPOINT;
const projectsRouter = express.Router();
projectsRouter.all('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const message = '';
        const projectService = new cinerinoapi.service.Project({
            endpoint: API_ENDPOINT,
            auth: req.user.authClient
        });
        const project = yield projectService.findById({ id: req.params.id });
        req.project = Object.assign(Object.assign({}, project), { settings: Object.assign(Object.assign({}, project.settings), { id: project.id, API_ENDPOINT: API_ENDPOINT }) });
        res.render('projects/edit', {
            message: message,
            project: req.project
        });
    }
    catch (error) {
        next(error);
    }
}));
projectsRouter.all('/:id/*', (req, _, next) => __awaiter(void 0, void 0, void 0, function* () {
    req.project = {
        typeOf: cinerinoapi.factory.organizationType.Project,
        id: req.params.id,
        settings: { id: req.params.id, API_ENDPOINT: API_ENDPOINT }
    };
    next();
}));
projectsRouter.get('/:id/logo', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let logo = 'https://s3-ap-northeast-1.amazonaws.com/cinerino/logos/cinerino.png';
    try {
        const projectService = new cinerinoapi.service.Project({
            endpoint: process.env.CINERINO_API_ENDPOINT,
            auth: req.user.authClient
        });
        const project = yield projectService.findById({ id: req.project.id });
        if (typeof project.logo === 'string') {
            logo = project.logo;
        }
    }
    catch (error) {
        // tslint:disable-next-line:no-console
        console.error(error);
    }
    res.redirect(logo);
}));
projectsRouter.use('/:id/home', home_1.default);
projectsRouter.use('/:id/accounts', accounts_1.default);
projectsRouter.use('/:id/actions', actions_1.default);
projectsRouter.use('/:id/transactions', transactions_1.default);
exports.default = projectsRouter;
