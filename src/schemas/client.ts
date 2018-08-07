import { Schema } from "mongoose";

export var clientSchema: Schema = new Schema({
    name: String,
    password: String,
    factClients: [[{ type: Schema.Types.ObjectId, ref: 'FactClient' }]]
});
