import {Observable} from "rxjs/Observable";
import {IStorage} from "nr-log-parser";

/***/
export interface ILogRule {
    /***/
    perform(logData: any, storeges: IStorage[]): Observable<any>;
}
