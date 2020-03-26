/**
 * ルーター
 */
import * as express from 'express';

import authentication from '../middlewares/authentication';

import authRouter from './auth';
import dashboardRouter from './dashboard';
import projectsRouter from './projects';

const router = express.Router();

// middleware that is specific to this router
// router.use((req, res, next) => {
//   debug('Time: ', Date.now())
//   next()
// })

router.use(authRouter);

router.use(authentication);
router.use(dashboardRouter);
router.use('/projects', projectsRouter);

export default router;
