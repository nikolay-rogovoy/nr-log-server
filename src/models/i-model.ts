import {Model} from "mongoose";
import {IClientModel} from "./i-client-model";
import {IFactModel} from "./i-fact-model";
import {IFactattribModel} from "./i-factattrib-model";

/***/
export interface IModel {
    /***/
    client: Model<IClientModel>;
    /***/
    fact: Model<IFactModel>;
    /***/
    factattrib: Model<IFactattribModel>;
}
