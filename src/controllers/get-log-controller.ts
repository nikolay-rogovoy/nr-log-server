import {IController} from './i-controller';
import {getLogger} from '../libs/logger';
import {Request, Response} from 'express-serve-static-core';
import {getServerAppMetadataArgsStorage} from "../metadata/common-metadata";
import {TestLogRule} from "../log-rules/test-log-rule";
import {createLogRule} from "../metadata/log-rule/log-rule-factory";
import {Auth} from "../libs/auth";
import {IModel} from "../models/i-model";
import {switchMap} from "rxjs/operators";
import {IAuthPayload} from "../libs/i-auth-payload";
import {_throw} from "rxjs/observable/throw";
import {empty} from "rxjs/observable/empty";
import {ConsoleStorage} from "nr-log-parser";
import {MongoStorage} from "../log-rules/mongo-storage";
import {of} from "rxjs/observable/of";
import {fromPromise} from "rxjs/observable/fromPromise";

/***/
export class GetLogController implements IController {

    /***/
    logger = getLogger(module);

    /***/
    auth = new Auth(this.model);

    /***/
    constructor(public model: IModel) {
    }

    /***/
    async handler(req: Request, res: Response) {
        this.logger.debug(`handleRoutes /getlog/:start/:end get`);

        this.auth.checkAuthorization(req, res)
            .pipe(
                switchMap((authorizationResult: IAuthPayload) => {
                        let start = Date.parse(req.params['start']);
                        let end = Date.parse(req.params['end']);

                        if (isNaN(start) || isNaN(end)) {
                            return _throw(new InvalidDate(''));
                        } else {
                            return fromPromise(this.model
                                .factClient.find()
                                // todo
                                .where('client').equals(authorizationResult.user.id)
                                .where('start').gte(start)
                                .where('end').lte(end));
                            // return fromPromise(this.model
                            //         .fact
                            //         .aggregate([
                            //             {
                            //                 $project: {
                            //                     name: 1,
                            //                     start: 1,
                            //                     end: 1,
                            //                     count: {$add: [1]}
                            //                 }
                            //             },
                            //             {
                            //                 $group: {
                            //                     _id: "$name", number: {$sum: "$count"},
                            //                 }
                            //             }
                            //         ])
                            //         .exec()
                        }
                    }
                )
            )
            .subscribe(
                (facts) => {
                    res.json({
                        message: `Successful`,
                        result: facts
                    });
                },
                (error => {
                    if (this.auth.isErrorAutorization(error)) {
                        this.auth.handleErrorAutorization(error, res)
                    } else if (error instanceof InvalidDate) {
                        res.status(400);
                        res.json({
                            message: 'Неудалось определить дату'
                        });
                    } else {
                        res.status(500);
                        res.json({
                            message: error.message
                        });
                    }
                })
            );
    }
}

/***/
class InvalidDate {
    /***/
    constructor(public message: string) {
    }
}
