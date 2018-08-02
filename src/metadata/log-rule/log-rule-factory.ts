import {ILogRuleCtor} from "./i-log-rule-ctor";
import {ILogRule} from "../../log-rules/i-log-rule";

export function createLogRule(ctor: ILogRuleCtor): ILogRule {
    return new ctor();
}
