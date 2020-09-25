/**
 * プロジェクトルーター
 */
import * as express from 'express';

import * as cinerinoapi from '../cinerinoapi';

import accountsRouter from './accounts';
import actionsRouter from './actions';
import homeRouter from './home';
import transactionsRouter from './transactions';

const API_ENDPOINT = <string>process.env.API_ENDPOINT;

const projectsRouter = express.Router();

projectsRouter.all(
    '/:id/*',
    async (req, _, next) => {
        req.project = {
            typeOf: cinerinoapi.factory.chevre.organizationType.Project,
            id: req.params.id,
            settings: { id: req.params.id, API_ENDPOINT: API_ENDPOINT }
        };

        next();
    }
);

projectsRouter.get(
    '/:id/logo',
    async (req, res) => {
        let logo = 'https://s3-ap-northeast-1.amazonaws.com/cinerino/logos/cinerino.png';

        try {
            const projectService = new cinerinoapi.service.Project({
                endpoint: <string>process.env.CINERINO_API_ENDPOINT,
                auth: req.user.authClient
            });
            const project = await projectService.findById({ id: req.project.id });

            if (typeof project.logo === 'string') {
                logo = project.logo;
            }
        } catch (error) {
            // tslint:disable-next-line:no-console
            console.error(error);
        }

        res.redirect(logo);
    }
);

projectsRouter.use('/:id/home', homeRouter);
projectsRouter.use('/:id/accounts', accountsRouter);
projectsRouter.use('/:id/actions', actionsRouter);
projectsRouter.use('/:id/transactions', transactionsRouter);

export default projectsRouter;
