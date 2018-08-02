/***/
import {IFactattrib} from "./i-factattrib";
import {IFact} from "./i-fact";

export interface IFactattribtype {
    /***/
    name: string;
    /***/
    date: Date;
    /***/
    check: (line: string, fact: IFact) => IFactattrib;
}
