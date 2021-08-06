/**
 * ダッシュボードルーター
 */
import { chevre } from '@cinerino/sdk';
import * as express from 'express';

const dashboardRouter = express.Router();

dashboardRouter.get(
    '/',
    async (req, res, next) => {
        try {
            // 管理プロジェクト検索
            const meService = new chevre.service.Me({
                endpoint: <string>process.env.CHEVRE_API_ENDPOINT,
                auth: req.user.authClient,
                project: { id: '' }
            });
            const searchProjectsResult = await meService.searchProjects({ limit: 100 });
            const projects = searchProjectsResult.data;

            res.render('dashboard', {
                layout: 'layouts/dashboard',
                message: 'Welcome to Pecorino Console!',
                projects: projects
            });
        } catch (error) {
            next(error);
        }
    });

export default dashboardRouter;
