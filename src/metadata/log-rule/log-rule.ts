import {getServerAppMetadataArgsStorage} from '../common-metadata';
import {ILogRuleCtor} from "./i-log-rule-ctor";

/***/
export function LogRule(name: string): Function {
    /***/
    return function (ctor: ILogRuleCtor) {
        getServerAppMetadataArgsStorage().logRules.push({
            name: name,
            ctor: ctor,
        });
    };
}