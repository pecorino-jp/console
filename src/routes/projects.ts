/**
 * プロジェクトルーター
 */
import { chevre } from '@cinerino/sdk';
import * as express from 'express';

import accountsRouter from './accounts';
import actionsRouter from './actions';
import homeRouter from './home';
import transactionsRouter from './transactions';

const projectsRouter = express.Router();

projectsRouter.all(
    '/:id/*',
    async (req, _, next) => {
        req.project = {
            typeOf: chevre.factory.organizationType.Project,
            id: req.params.id
        };

        next();
    }
);

projectsRouter.get(
    '/:id/logo',
    async (req, res) => {
        let logo = 'https://s3-ap-northeast-1.amazonaws.com/cinerino/logos/cinerino.png';

        try {
            const projectService = new chevre.service.Project({
                endpoint: <string>process.env.CHEVRE_API_ENDPOINT,
                auth: req.user.authClient,
                project: { id: '' }
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
