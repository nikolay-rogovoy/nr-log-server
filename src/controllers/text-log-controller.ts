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

/***/
export class TextLogController implements IController {

    /***/
    logger = getLogger(module);

    /***/
    auth = new Auth(this.model);

    /***/
    constructor(public model: IModel) {
    }

    /***/
    async handler(req: Request, res: Response) {
        this.logger.debug('handleRoutes /textlog post');

        this.auth.checkAuthorization(req, res)
            .pipe(switchMap((authorizationResult: IAuthPayload) => {
                    if (authorizationResult) {
                        let source = authorizationResult.user;

                        // Правило для анализа лога
                        let rule = req.body.rule;

                        if (!rule) {
                            return _throw(new NoRuleInRequest('Нет правила в запросе клиента'));
                        }

                        if (!req.body.data) {
                            return _throw(new DataNotFound('Нет данных в запросе клиента'));
                        }

                        let logRuleCtor = getServerAppMetadataArgsStorage().logRules.find(x => x.name === rule);

                        if (!logRuleCtor) {
                            return _throw(new RuleNotFound('Нет правила на серевере'));
                        }

                        // todo!!!!!!!
                        let dd = new TestLogRule();

                        let logRuleInstance = createLogRule(logRuleCtor.ctor);
                        return logRuleInstance.perform(req.body.data);
                    }
                }
            ))
            .subscribe(
                (line) => {
                    this.logger.debug(line);
                    console.log(`passed: ${line}`);
                },
                (error => {
                    if (error instanceof NoRuleInRequest || error instanceof RuleNotFound || error instanceof DataNotFound) {
                        res.status(400);
                        res.json({
                            message: error.message
                        });
                    } else {
                        res.status(500);
                        res.json({
                            message: error.message
                        });
                    }
                }),
                () => {
                    res.json({
                        message: `Successful`
                    });
                }
            );
    }
}

/***/
class NoRuleInRequest {
    /***/
    constructor(public message: string) {
    }
}

/***/
class RuleNotFound {
    /***/
    constructor(public message: string) {
    }
}

/***/
class DataNotFound {
    /***/
    constructor(public message: string) {
    }
}

