/***/
import {IFact} from "./i-fact";
import {Observable} from "rxjs/Observable";

export interface IStorage {
    /***/
    write(fact: IFact): Observable<any>;
}
