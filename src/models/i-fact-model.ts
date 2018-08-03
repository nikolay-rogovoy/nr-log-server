import {Document} from "mongoose";
import {IFact} from "nr-log-parser/i-fact";

/***/
export interface IFactModel extends IFact, Document {
}
