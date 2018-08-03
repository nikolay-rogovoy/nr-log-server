import {Schema} from "mongoose";
// import {IFactattrib} from "nr-log-parser/i-factattrib";

export var factattribSchema: Schema = new Schema({
    /***/
    name: String,
    /***/
    value: String,
});
