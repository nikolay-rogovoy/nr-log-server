import {IStorage} from "./i-storage";
import {IFact} from "./i-fact";
import {Observable} from "rxjs/Observable";
import {of} from "rxjs/observable/of";

/***/
export class ConsoleStorage implements IStorage {
    /***/
    write(fact: IFact): Observable<any> {
        console.log(JSON.stringify(fact));
        return of(null);
    }
}