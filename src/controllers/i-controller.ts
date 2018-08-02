import {Request, Response} from 'express-serve-static-core';

export interface IController {
    handler (req: Request, res: Response);
}
