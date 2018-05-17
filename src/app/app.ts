/**
 * Expressアプリケーション
 * @ignore
 */
import * as bodyParser from 'body-parser';
// import * as createDebug from 'debug';
import * as express from 'express';
import * as expressLayouts from 'express-ejs-layouts';

import errorHandler from './middlewares/errorHandler';
import notFoundHandler from './middlewares/notFoundHandler';

// const debug = createDebug('pecorino-console:*');

const app = express();

// view engine setup
app.set('views', `${__dirname}/../../views`);
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout extractScripts', true);

app.use(bodyParser.json());
// The extended option allows to choose between parsing the URL-encoded data
// with the querystring library (when false) or the qs library (when true).
app.use(bodyParser.urlencoded({ extended: true }));

// 静的ファイル
app.use(express.static(`${__dirname}/../../public`));
app.use('/node_modules', express.static(`${__dirname}/../../node_modules`));

// routers
import router from './routes/router';
app.use('/', router);

// 404
app.use(notFoundHandler);

// error handlers
app.use(errorHandler);

export = app;
