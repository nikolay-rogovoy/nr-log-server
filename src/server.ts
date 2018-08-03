import "reflect-metadata";
import * as express from 'express';
import * as bodyParser from 'body-parser';
import {RestRouter} from './rest-router';
import {getLogger} from './libs/logger';
import {Router} from "express-serve-static-core";
import config from './config/config';
import * as http from "http";
import {fromPromise} from "rxjs/observable/fromPromise";
import {of} from "rxjs/observable/of";
import {map, switchMap, switchMapTo} from "rxjs/operators";
import {Mongoose} from "mongoose";
import {IClientModel} from "./models/i-client-model";
import {clientSchema} from "./schemas/client";
import {IModel} from "./models/i-model";
import mongoose = require("mongoose");
import {Observable} from "rxjs/Observable";
import {factSchema} from "./schemas/fact";
import {IFactModel} from "./models/i-fact-model";
import {IFactattribModel} from "./models/i-factattrib-model";


/**OKNA.space backend server*/
export class Server {

    /***/
    logger = getLogger(module);

    /**express*/
    app: express.Application;

    /***/
    httpServer: http.Server;

    /***/
    model = <IModel>{};

    /***/
    mongoose: Mongoose;

    /**Конструктор*/
    constructor() {
        this.logger.debug('> Server()');
        this.app = express();
        this.httpServer = http.createServer(this.app);
        this.configServer()
            .pipe(
                switchMap(() => this.initMongoose()),
                switchMap(() => this.configureExpress()),
                switchMap(() => this.startServer())
            )
            .subscribe(() => {
                    this.logger.debug('server started');
                },
                (error) => {
                    this.logger.error(error);
                }
            );
    }

    /**Конфигурация сервера*/
    configServer(): Observable<boolean> {
        this.logger.debug('> configServer');
        return of(true);
    }

    /**Получить соединение с постгрес*/
    initMongoose(): Observable<boolean> {
        this.logger.debug('> initMongoose');
        return fromPromise(mongoose.connect(config.get('db:connection'), {
            useNewUrlParser: true,
            config: {autoIndex: false}
        }))
            .pipe(
                map((mongoose: Mongoose) => {
                    // todo debugger
                    this.mongoose = mongoose;
                    this.model.client = mongoose.model<IClientModel>('Client', clientSchema);
                    this.model.fact = mongoose.model<IFactModel>('Fact', factSchema);
                    this.model.factattrib = mongoose.model<IFactattribModel>('Factattrib', factSchema);
                    return true;
                })
            );
    }

    /**Конфигурация HTTP сервера*/
    configureExpress(): Observable<boolean> {
        this.logger.debug('> configureExpress');
        this.app.use(function (req, res, next) {
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
        let restRouter = new RestRouter(this.model, this.mongoose);
        restRouter.handleRoutes(router);
        return of(true);
    }

    /**Запуск сервера*/
    startServer(): Observable<boolean> {
        this.logger.debug('> startServer');
        this.httpServer.listen(config.get('express:port'), function () {
        });
        return of(true);
    }

    /**Остановка сервера*/
    stop(err) {
        this.logger.debug("stop - OK", err);
        process.exit(1);
    }

}
