import {getLogger} from './logger';
import * as jwt from 'jsonwebtoken';
import {Request, Response} from "express-serve-static-core";
import {IAuthPayload} from "./i-auth-payload";
import {fromPromise} from "rxjs/observable/fromPromise";
import {Observable} from "rxjs/Observable";
import {catchError, map} from "rxjs/operators";
import {of} from "rxjs/observable/of";
import {_throw} from "rxjs/observable/throw";
import {IModel} from "../models/i-model";
import * as crypto from "crypto";
import {IClientModel} from "../models/i-client-model";

export class Auth {

    /***/
    logger = getLogger(module);

    /**Ключ шифровки JWT*/
    get getSecret() {
        return 'TOPSECRETTTTT';
    };

    /***/
    constructor(public model: IModel) {
    }

    /**Проверить токен JWT*/
    checkAuthorization(req: Request, res: Response): Observable<IAuthPayload> {
        return this.decodeAuthorizationToken(req)
            .pipe(map((authorizationResult) => {
                    // Предоставлен доступ для
                    this.logger.info(`Предоставлен доступ для ${JSON.stringify(authorizationResult)}`);
                    return authorizationResult;
                })
            );
    }

    /**Разбор заголовка*/
    decodeAuthorizationToken(req): Observable<IAuthPayload> {
        // Получить заголовок авторизации
        let token = req.get('Authorization');
        if (token != null) {
            if (token.startsWith("Bearer<") || token.startsWith("Bearer <")) {
                if (token.startsWith("Bearer <")) {
                    token = token.substring(8, token.length - 1);
                } else {
                    token = token.substring(7, token.length - 1);
                }
                try {
                    jwt.verify(token, this.getSecret);
                    // Токен нормальный
                    let payload = <IAuthPayload>jwt.decode(token);
                    // Не валидный токен, такого быть не должно
                    if (!payload.user.id) {
                        return _throw(new PayloadInvalid(JSON.stringify(payload)));
                    }
                    return this.checkPayload(payload);
                } catch (error) {
                    if (error instanceof PayloadInvalid) {
                        this.logger.error(`Неопределен payload.user.id для токена token=${token}`);
                        throw error;
                    } else {
                        return _throw(new InvalidToken(`Ошибка верификации токена token=${token}`));
                    }
                }
            } else {
                return _throw(new BadAutorizationHeader(`Неправильный формат Authorization token=${token}`));
            }
        } else {
            return _throw(new NoAutorizationHeader(`Для запроса не определен заголовок Authorization`));
        }
    }

    /***/
    checkPayload(payload: IAuthPayload): Observable<IAuthPayload> {
        return fromPromise(
            this.model.client.findById(payload.user.id)
                .exec()
        )
            .pipe(
                map(
                    (client: IClientModel) => {
                        if (client && crypto.createHash('md5').update(client.password).digest("hex") === payload.user.password) {
                            return payload;
                        } else {
                            throw new InvalidPayload('Неправильная полезная нагрузка');
                        }
                    }
                )
            );
    }

    /***/
    isErrorAutorization(error) {
        if (error instanceof InvalidToken ||
            error instanceof BadAutorizationHeader ||
            error instanceof NoAutorizationHeader ||
            error instanceof PayloadInvalid ||
            error instanceof InvalidPayload
        ) {
            return true;
        } else {
            return false;
        }
    }

    /***/
    handleErrorAutorization(error, res: Response) {
        if (error instanceof InvalidToken ||
            error instanceof BadAutorizationHeader ||
            error instanceof NoAutorizationHeader ||
            error instanceof PayloadInvalid ||
            error instanceof InvalidPayload
        ) {
            // Не авторизованный доступ
            this.logger.error(`Неавторизованный доступ ${error.message}`);
            res.status(401);
            res.end();
            return true;
        } else {
            return false;
        }
    }
}


/***/
class InvalidToken {
    /***/
    constructor(public message: string) {
    }
}

/***/
class BadAutorizationHeader {
    /***/
    constructor(public message: string) {
    }
}

/***/
class NoAutorizationHeader {
    /***/
    constructor(public message: string) {
    }
}

/***/
class InvalidPayload {
    /***/
    constructor(public message: string) {
    }
}

/***/
class PayloadInvalid {
    /***/
    constructor(public message: string) {
    }
}
