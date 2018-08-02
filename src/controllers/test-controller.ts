import {IController} from './i-controller';
import {getLogger} from '../libs/logger';
import {Request, Response} from 'express-serve-static-core';

/***/
export class TestController implements IController {

    /***/
    logger = getLogger(module);

    /***/
    constructor() {
    }

    /***/
    async handler(req: Request, res: Response) {
        this.logger.debug('handleRoutes /test get');

        res.json({message: `Test api - OK. (get)`});
    }
}
