import {ILogRule} from "../../log-rules/i-log-rule";

/***/
export interface ILogRuleCtor {
    /***/
    new(): ILogRule;
}
