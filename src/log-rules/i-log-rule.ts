import {Observable} from "rxjs/Observable";

/***/
export interface ILogRule {
    /***/
    perform(logData: any): Observable<any>;
}
