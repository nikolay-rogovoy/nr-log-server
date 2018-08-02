import {IController} from './i-controller';
import {getLogger} from '../libs/logger';
import {Request, Response} from 'express-serve-static-core';
import {getServerAppMetadataArgsStorage} from "../metadata/common-metadata";
import {ILogRule} from "../log-rules/i-log-rule";
import {assert} from "chai";
import {loggers} from "../../node_modules/winston/scratch/1280/node_modules/winston";
import {TestLogRule} from "../log-rules/test-log-rule";
import {createLogRule} from "../metadata/log-rule/log-rule-factory";

/***/
export class TextLogController implements IController {

    /***/
    logger = getLogger(module);

    /***/
    constructor() {
    }

    /***/
    async handler(req: Request, res: Response) {
        this.logger.debug('handleRoutes /textlog post');

        // todo авторизация

        // todo
        let source = 'todo';

        // Правило для анализа лога
        let rule = req.body.rule;

        if (!rule) {
            res.status(400);
            res.json({
                message: `Нет правила в запросе клиента`
            });
            return;
        }

        if (!req.body.data) {
            res.status(400);
            res.json({
                message: `Нет данных в запросе клиента`
            });
            return;
        }

        let logRuleCtor = getServerAppMetadataArgsStorage().logRules.find(x => x.name === rule);

        if (!logRuleCtor) {
            res.status(400);
            res.json({
                message: `Нет правила на серевере`
            });
            return;
        }

        // todo!!!!!!!
        let dd = new TestLogRule();

        let logRuleInstance = createLogRule(logRuleCtor.ctor);
        logRuleInstance.perform(req.body.data)
            .subscribe(
                (line) => {
                    this.logger.debug(line);
                    console.log(`passed: ${line}`);
                },
                (error => {
                    res.status(500);
                    res.json({
                        message: error
                    });
                }),
                () => {
                    res.json({
                        message: `Successful`
                    });
                }
            );
    }
}
