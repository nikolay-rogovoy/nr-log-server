import {ILogRule} from "./i-log-rule";
import {Readable} from "stream";
import {Observable} from "rxjs/Observable";
import {LogRule} from "../metadata/log-rule/log-rule";
import {getLogParser} from "./getLogParser";
import {ILogRuleParam} from "./i-log-rule-param";
import {getOknaSpaceFactTypes} from "./fact-types/get-okna-space-fact-types";

/***/
@LogRule('test log')
export class TestLogRule implements ILogRule {

    /***/
    facttypes = getOknaSpaceFactTypes();

    /***/
    perform(param: ILogRuleParam): Observable<any> {
        let stream = new Readable();
        stream.push(param.logData);
        stream.push(null);
        let parser = getLogParser(param.id, this.facttypes, param.storeges);
        return parser.parse(stream);
    }
}
