import {IFactClient} from "./i-fact-client";

/***/
export interface IClient {
    /***/
    name: string;
    /***/
    password: string;
    /***/
    factClients: IFactClient[]
}
