/**
 * ダッシュボードルーター
 */
// import * as createDebug from 'debug';
import * as express from 'express';
// import * as moment from 'moment';

import * as cinerinoapi from '../cinerinoapi';

// const debug = createDebug('cinerino-console:routes');
const dashboardRouter = express.Router();

dashboardRouter.get(
    '/',
    async (req, res, next) => {
        try {
            const projectService = new cinerinoapi.service.Project({
                endpoint: <string>process.env.CINERINO_API_ENDPOINT,
                auth: req.user.authClient
            });

            const searchProjectsResult = await projectService.search({});
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
