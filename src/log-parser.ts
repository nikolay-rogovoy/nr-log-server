import {IStorage} from "./i-storage";
import * as readline from "readline";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {concatMap, filter, finalize, map, mapTo, mergeMap, reduce, switchMap} from "rxjs/operators";
import {Observable} from "rxjs/Observable";
import {IFacttype} from "./i-facttype";
import {IFact} from "./i-fact";
import {IFactattribtype} from "./i-factattribtype";
import {forkJoin} from "rxjs/observable/forkJoin";
import {of} from "rxjs/observable/of";
import {from} from "rxjs/observable/from";

/***/
export class LogParser {

    /***/
    activeFacts: IFact[] = [];

    /***/
    constructor(public facttypes: IFacttype[],
                public inStream: NodeJS.ReadableStream,
                public storages: IStorage[]) {
    }

    /***/
    parse(): Observable<any> {
        return this.getLineReader()
            .pipe(
                mergeMap((line) => {
                    return from(this.facttypes)
                        .pipe(
                            mergeMap((facttype) => {
                                this.checkNewFact(facttype, line);
                                return this.checkActiveFacts(facttype, line)
                                    .pipe(mapTo(facttype));
                            }),
                            reduce((acc, val: IFacttype) => {
                                if (val) {
                                    acc.push(val);
                                }
                                return acc;
                            }, []),
                            mapTo(line),
                        );
                }),
                finalize(() => {
                    this.saveIncompleteFacts().subscribe();
                })
            );
    }

    /***/
    saveIncompleteFacts() {
        return forkJoin(...this.activeFacts.map(fact => this.saveFactInStoreges(fact)))
    }

    /***/
    checkActiveFacts(facttype: IFacttype, line: string): Observable<IFact[]> {
        return from(this.activeFacts.slice())
            .pipe(
                map((fact) => {
                    this.checkAttribs(facttype, fact, line);
                    return fact;
                }),
                switchMap((fact: IFact) => {
                    let endFact = facttype.checkEnd(line, fact);
                    if (endFact) {
                        return this.compliteFact(fact, endFact)
                            .pipe(mapTo(fact));
                    } else {
                        return of(null);
                    }
                }),
                reduce((acc, val: IFact) => {
                    if (val) {
                        acc.push(val);
                    }
                    return acc;
                }, [])
            );
    }

    /***/
    checkAttribs(facttype: IFacttype, fact: IFact, line: string) {
        for (let factattribtype of facttype.factattribtypes) {
            this.checkAttrib(factattribtype, fact, line);
        }
    }

    /***/
    checkAttrib(factattribtype: IFactattribtype, fact: IFact, line: string) {
        let attrib = factattribtype.check(line, fact);
        if (attrib) {
            fact.factattrib.push(attrib);
        }
    }

    /***/
    checkNewFact(facttype: IFacttype, line: string) {
        let newFact = facttype.check(line);
        if (newFact) {
            this.activeFacts.push(newFact);
        }
    }

    /***/
    compliteFact(fact: IFact, endFact: Date): Observable<any> {
        fact.end = endFact;
        return this.saveFactInStoreges(fact).pipe(
            map((resultSave) => {
                this.removeComplitedFact(fact);
                return resultSave;
            })
        );

    }

    /***/
    saveFactInStoreges(fact: IFact): Observable<any> {
        return forkJoin(...this.storages.map(storage => storage.write(fact)));
    }

    /***/
    removeComplitedFact(fact: IFact) {
        let index = this.activeFacts.indexOf(fact);
        if (index !== -1)
            this.activeFacts.splice(index, 1);
    }

    /***/
    getLineReader(): Observable<string> {
        let bs = new BehaviorSubject(null);
        let lineReader = readline.createInterface({
            input: this.inStream
        });
        lineReader.on('line', (input: any) => {
            bs.next(input);
        });
        lineReader.on('close', (input: any) => {
            bs.complete();
        });
        return bs.pipe(filter(x => x != null));
    }
}
