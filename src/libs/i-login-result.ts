/***/
import {ILoginUserInfo} from "./i-login-user-Info";

export interface ILoginResult {
    /***/
    message: string,
    /***/
    success: boolean,
    /***/
    token: string,
    /***/
    user: ILoginUserInfo
}
