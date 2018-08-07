import {Model} from "mongoose";
import {IClientModel} from "./i-client-model";
import {IFactClientModel} from "./i-fact-client-model";
import {IFactattribModel} from "./i-factattrib-model";

/***/
export interface IModel {
    /***/
    client: Model<IClientModel>;
    /***/
    factClient: Model<IFactClientModel>;
    /***/
    factattrib: Model<IFactattribModel>;
}
