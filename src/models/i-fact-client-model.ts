import {Document} from "mongoose";
import {IFactClient} from "../interfaces/i-fact-client";

/***/
export interface IFactClientModel extends IFactClient, Document {
}
