import { Schema } from "mongoose";
import {factattribSchema} from "./factattrib";
// import {IFactattrib} from "nr-log-parser/i-factattrib";

export var factSchema: Schema = new Schema({
    start: Date,
    end: Date,
    name: String,
    factattrib: [factattribSchema]
});
