import {IStorage} from "nr-log-parser";

/***/
export interface ILogRuleParam {
    /***/
    id: string,
    /***/
    logData: any,
    /***/
    storeges: IStorage[]
}
