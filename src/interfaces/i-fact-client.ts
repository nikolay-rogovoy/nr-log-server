import {IFact} from "nr-log-parser/i-fact";
import {IClient} from "./i-client";

/***/
export interface IFactClient extends IFact {
    /***/
    client: IClient | string;
}
