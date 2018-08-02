import {IFacttype} from "./i-facttype";
import {IFactattrib} from "./i-factattrib";

/***/
export interface IFact {
    /***/
    start: Date;
    /***/
    end: Date;
    /***/
    name: string,
    /***/
    factattrib: IFactattrib[]
}
