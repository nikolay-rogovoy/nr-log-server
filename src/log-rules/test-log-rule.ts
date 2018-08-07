import {ILogRule} from "./i-log-rule";
import {ConsoleStorage, IFactattribtype, IFacttype, IStorage, LogParser} from "nr-log-parser";
import {IFact} from "nr-log-parser/i-fact";
import {IFactattrib} from "nr-log-parser/i-factattrib";
import {Readable} from "stream";
import {Observable} from "rxjs/Observable";
import {LogRule} from "../metadata/log-rule/log-rule";
import {getLogParser} from "./getLogParser";
import {ILogRuleParam} from "./i-log-rule-param";

/***/
@LogRule('test log')
export class TestLogRule implements ILogRule {

    /***/
    facttypes = [
        <IFacttype> {
            name: 'test log',
            check: (line: string) => {
                let regExp = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z);(\d+) start task$/g;
                let regExpResult;
                while (regExpResult = regExp.exec(line)) {
                    let start = new Date(regExpResult[1]);
                    let factNum = Number.parseInt(regExpResult[2]);
                    return <IFact>{
                        start,
                        name: 'test log',
                        end: null,
                        factattrib: [
                            <IFactattrib> {
                                name: 'factNum',
                                value: factNum
                            }
                        ]
                    };
                }
                return null
            },
            checkEnd: (line: string, fact: IFact) => {
                try {
                    let regExp = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z);(\d+) end task$/g;
                    let regExpResult;
                    while (regExpResult = regExp.exec(line)) {
                        let end = new Date(regExpResult[1]);
                        let factNum = Number.parseInt(regExpResult[2]);
                        if (fact.name === 'test log') {
                            if (fact.factattrib.find(x => x.name === 'factNum').value === factNum) {
                                return end;
                            }
                        }
                    }
                }
                catch (error) {
                    throw error;
                }
                return null
            },
            factattribtypes: [
                <IFactattribtype>{
                    name: 'attrib',
                    check: (line: string, fact: IFact) => {
                        let regExp = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z);(\d+) attrib (\d+)$/g;
                        let regExpResult;
                        while (regExpResult = regExp.exec(line)) {
                            let date = new Date(regExpResult[1]);
                            let factNum = Number.parseInt(regExpResult[2]);
                            if (fact.name === 'test log') {
                                if (fact.factattrib.find(x => x.name === 'factNum').value === factNum) {
                                    return <IFactattrib>{
                                        date,
                                        name: 'attrib',
                                        value: regExpResult[3],
                                    };
                                }
                            }
                        }
                        return null
                    }
                }
            ]
        }
    ];

    /***/
    perform(param: ILogRuleParam): Observable<any> {
        let stream = new Readable();
        stream.push(param.logData);
        stream.push(null);
        let parser = getLogParser(param.id, this.facttypes, param.storeges);
        return parser.parse(stream);
    }
}
