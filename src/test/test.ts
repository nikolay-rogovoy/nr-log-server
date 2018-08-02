// Reference mocha-typescript's global definitions:
/// <reference path="../../node_modules/mocha-typescript/globals.d.ts" />

import {ConsoleStorage, IFactattribtype, LogParser} from '../index';
import {assert} from 'chai';
import {IFacttype} from "../i-facttype";
import {Readable} from "stream";
import {suite, test, timeout} from "mocha-typescript";
import {IFact} from "../i-fact";
import {IFactattrib} from "../i-factattrib";

@suite(timeout(2000))
class UnitTest extends LogParser {
    @test 'LogParser'(done) {


        let testData = `
2018-07-31T09:44:46.013Z;1471 start task
2018-07-31T09:44:46.014Z;1471 attrib 123
2018-07-31T09:44:46.013Z;1472 start task
2018-07-31T09:44:46.014Z;1472 attrib 321
2018-07-31T09:44:46.173Z;1471 end task
2018-07-31T09:44:46.173Z;1472 end task
2018-07-31T09:44:46.013Z;1473 start task
2018-07-31T09:44:46.014Z;1473 attrib 123
`;

        let facttypes = [
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
        let stream = new Readable();
        stream.push(testData);
        stream.push(null);
        let logParser = new LogParser(facttypes, stream, [new ConsoleStorage()]);

        logParser.parse()
            .subscribe(
                (line) => {
                    console.log(`passed: ${line}`);
                },
                (error => {
                    done(error);
                }),
                () => {
                    assert(true);
                    done();
                }
            );
    }
}
