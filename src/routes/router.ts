/**
 * ルーター
 */
import * as express from 'express';

import authentication from '../middlewares/authentication';

import accountsRouter from './accounts';
import actionsRouter from './actions';
import authRouter from './auth';
import homeRouter from './home';
import transactionsRouter from './transactions';

const router = express.Router();

// middleware that is specific to this router
// router.use((req, res, next) => {
//   debug('Time: ', Date.now())
//   next()
// })

router.use(authRouter);

router.use(authentication);
router.use(homeRouter);
router.use('/accounts', accountsRouter);
router.use('/actions', actionsRouter);
router.use('/transactions', transactionsRouter);

export default router;
