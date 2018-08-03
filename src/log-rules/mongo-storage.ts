import {Observable} from "rxjs/Observable";
import {IStorage} from "nr-log-parser";
import {IFact} from "nr-log-parser/i-fact";
import {IFactModel} from "../models/i-fact-model";
import {Model} from "mongoose";
import {fromPromise} from "rxjs/observable/fromPromise";
import {switchMap} from "rxjs/operators";

/***/
export class MongoStorage implements IStorage {

    /***/
    constructor(public model: Model<IFactModel>) {
    }

    /***/
    write(fact: IFact): Observable<any> {
        return fromPromise(this.model.create(fact))
            .pipe(
                switchMap((factModel: IFactModel) => {
                    return fromPromise(factModel.save());
                })
            );
    }
}
