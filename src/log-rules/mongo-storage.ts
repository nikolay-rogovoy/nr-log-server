import {Observable} from "rxjs/Observable";
import {IStorage} from "nr-log-parser";
import {IFact} from "nr-log-parser/i-fact";
import {Model} from "mongoose";
import {fromPromise} from "rxjs/observable/fromPromise";
import {switchMap} from "rxjs/operators";
import {IFactClientModel} from "../models/i-fact-client-model";
import {IClient} from "../interfaces/i-client";

/***/
export class MongoStorage implements IStorage {

    /***/
    constructor(public model: Model<IFactClientModel>, public idclient: string) {
    }

    /***/
    write(fact: IFact): Observable<any> {
        const factClientModel = <IFactClientModel>fact;
        factClientModel.client = this.idclient;
        return fromPromise(this.model.create(fact));
    }
}
