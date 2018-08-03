import {Document} from "mongoose";
import {IFactattrib} from "nr-log-parser/i-factattrib";

/***/
export interface IFactattribModel extends IFactattrib, Document {
}
