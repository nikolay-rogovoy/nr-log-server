import {Model} from "mongoose";
import {IClientModel} from "./i-client-model";

/***/
export interface IModel {
    /***/
    client: Model<IClientModel>;
}
