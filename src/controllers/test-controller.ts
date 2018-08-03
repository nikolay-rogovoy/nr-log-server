import {IController} from './i-controller';
import {getLogger} from '../libs/logger';
import {Request, Response} from 'express-serve-static-core';
import {IModel} from "../models/i-model";
import {Mongoose} from "mongoose";
import {fromPromise} from "rxjs/observable/fromPromise";

/***/
export class TestController implements IController {

    /***/
    logger = getLogger(module);

    /***/
    constructor(public model: IModel, public mongoose: Mongoose) {
    }

    /***/
    async handler(req: Request, res: Response) {
        this.logger.debug('handleRoutes /test get');
        // let cl = await this.model.client.create({name: "gso", password: "456321"});
        // cl.save();
        // let c2 = await this.model.client.create({name: "test", password: "456321"});
        // c2.save();
        //
        // debugger;
        // let dd = await this.model.client.find().exec();
        // dd.forEach(x => {
        //     x.password = "456321";
        //     x.save();
        // });
        // this.logger.debug(JSON.stringify(dd));

        res.json({message: `Test api - OK. (get)`});
    }
}
