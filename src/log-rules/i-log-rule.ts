import {Observable} from "rxjs/Observable";
import {IStorage} from "nr-log-parser";
import {ILogRuleParam} from "./i-log-rule-param";

/***/
export interface ILogRule {
    /***/
    perform(param: ILogRuleParam): Observable<any>;
}
