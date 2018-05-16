/**
 * ルーター
 * @ignore
 */
import * as express from 'express';

import accountsRouter from './accounts';
import authRouter from './auth';
import homeRouter from './home';

const router = express.Router();

// middleware that is specific to this router
// router.use((req, res, next) => {
//   debug('Time: ', Date.now())
//   next()
// })

router.use(authRouter);
router.use(homeRouter);
router.use('/accounts', accountsRouter);

export default router;
