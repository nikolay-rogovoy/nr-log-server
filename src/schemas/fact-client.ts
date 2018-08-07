import {Schema} from "mongoose";
import {factattribSchema} from "./factattrib";

export var factClientSchema: Schema = new Schema({
    start: Date,
    end: Date,
    name: String,
    client: {type: Schema.Types.ObjectId, ref: 'Client'},
    factattrib: [factattribSchema]
});
