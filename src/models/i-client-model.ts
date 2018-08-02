import {Document} from "mongoose";
import {IClient} from "../interfaces/i-client";

/***/
export interface IClientModel extends IClient, Document {
}
