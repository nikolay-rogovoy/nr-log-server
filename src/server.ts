import "reflect-metadata";
import * as express from 'express';
import * as bodyParser from 'body-parser';
import {RestRouter} from './rest-router';
import {getLogger} from './libs/logger';
import {Router} from "express-serve-static-core";
import config from './config/config';
import * as http from "http";

/**OKNA.space backend server*/
export class Server {

    /***/
    logger = getLogger(module);

    /**express*/
    app: express.Application;

    /***/
    httpServer: http.Server;

    /***/
    restRouter: RestRouter = new RestRouter();

    /**Конструктор*/
    constructor() {
        this.logger.debug('> Server()');
        this.app = express();
        this.httpServer = http.createServer(this.app);
        this.configServer();
        this.logger.debug('< Server()');
    }

    /**Конфигурация сервера*/
    configServer() {
        this.logger.debug('> configServer');
        this.logger.debug('< configServer');
        this.initSequilize();
    }

    /**Получить соединение с постгрес*/
    initSequilize() {
        this.logger.debug('> initSequilize');
        this.logger.debug('< initSequilize');
        this.configureExpress();
    }

    /**Конфигурация HTTP сервера*/
    configureExpress() {
        this.logger.debug('> configureExpress');
        this.app.use(function (req, res, next) {
            // if (origins.indexOf(req.header('host').toLowerCase()) > -1) {
            //     res.header('Access-Control-Allow-Origin', `${req.headers.origin}`);
            // }
            res.header('Access-Control-Allow-Origin', `*`);
            res.header('Access-Control-Allow-Credentials', `true`);
            res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE,PUT');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
            next();
        });
        this.app.use(bodyParser.urlencoded({extended: true}));

        /**
         * https://stackoverflow.com/questions/19917401/error-request-entity-too-large
         * Размер для парсера, обязательно нужно установить
         * */
        this.app.use(bodyParser.json({limit: '50mb'}));
        let router: Router = express.Router();
        this.app.use('/api', router);
        this.restRouter.handleRoutes(router);
        this.startServer();
        this.logger.debug('< configureExpress');
    };

    /**Запуск сервера*/
    startServer() {
        this.logger.debug('> startServer');
        this.httpServer.listen(config.get('express:port'), function(){});
        this.logger.debug('< startServer');
    };

    /**Остановка сервера*/
    stop(err) {
        this.logger.debug("stop - OK", err);
        process.exit(1);
    };

}


