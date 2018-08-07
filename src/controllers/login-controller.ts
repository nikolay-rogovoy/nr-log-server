import {IController} from './i-controller';
import {getLogger} from '../libs/logger';
import {Request, Response} from 'express-serve-static-core';
import * as jwt from "jsonwebtoken";
import * as crypto from 'crypto';
import {IModel} from "../models/i-model";
import {fromPromise} from "rxjs/observable/fromPromise";
import {map} from "rxjs/operators";
import {IClientModel} from "../models/i-client-model";
import {IAuthUser} from "../libs/i-auth-user";
import {Auth} from "../libs/auth";
import {IAuthPayload} from "../libs/i-auth-payload";
import {ILoginResult} from "../libs/i-login-result";

/***/
export class LoginController implements IController {

    /***/
    logger = getLogger(module);

    /***/
    auth = new Auth(this.model);

    /***/
    constructor(public model: IModel) {
    }

    /***/
    async handler(req: Request, res: Response) {
        this.logger.debug('handleRoutes /login');

        let userUnfo = req.body;

        // Проверка объекта на правильность
        if (userUnfo.user == null) {
            let message = `Нет поля user: ${JSON.stringify(userUnfo)}`;
            this.logger.error(message);
            res.json({message: message, success: false});
            return;
        }
        if (userUnfo.pass == null) {
            let message = `Нет поля pass: ${JSON.stringify(userUnfo)}`;
            this.logger.error(message);
            res.json({message: message, success: false});
            return;
        }

        let user = userUnfo.user;
        let pass = userUnfo.pass;

        // Обязательно должны быть заполнены
        if (user === '' || pass === '') {
            let message = `Логин и пароль не должны быть пустыми`;
            this.logger.error(message);
            res.json({message: message, success: false});
            return;
        }

        // Запросить данные в базе
        fromPromise(this.model.client.find()
            .where('name').equals(user)
            .where('password').equals(pass)
            .exec()
        )
            .pipe(
                map((clients: IClientModel[]) => {
                    if (clients.length > 1) {
                        // Несколько записей, такого быть не должно
                        let message = `Несколько записей для ${user}`;
                        this.logger.error(message);
                        res.status(500);
                        res.json({message: message, success: false});
                    } else if (clients.length === 0) {
                        // Не найдено записей, значит логин/пароль неправильный
                        let message = `Неправильный логин/пароль`;
                        this.logger.info(message);
                        res.json({message: message, success: false});
                    } else {
                        let client = clients[0];
                        // Найден пользователь
                        let payload = <IAuthPayload>{
                            iss: 'my_issurer',
                            aud: 'World',
                            iat: 1400062400223,
                            typ: '/online/transactionstatus/v2',
                            user: <IAuthUser>{
                                id: client.id,
                                name: client.name,
                                password: crypto.createHash('md5').update(client.password).digest("hex")
                            }
                        };
                        // Получить токен
                        //let token =
                        jwt.sign(payload, this.auth.getSecret, (errorJWT, token) => {
                            if (errorJWT) {
                                // Ошибка получения токена
                                res.status(500);
                                res.json({message: errorJWT, success: false});
                                return;
                            } else {
                                // Вернуть токен
                                this.logger.debug(`Пользователь прошел авторизацию успешно: ${user}`);
                                res.json(
                                    <ILoginResult> {
                                        message: 'Successful',
                                        success: true,
                                        token: token,
                                        user: {
                                            id: client.id,
                                            name: client.name
                                        }
                                    });
                                return;
                            }
                        });
                    }
                })
            )
            .subscribe(() => {
                },
                (error) => {
                    let errorMessage = `Ошибка получения данных из БД о пользователе: user = ${user}; ${error}`;
                    this.logger.error(errorMessage);
                    res.status(500);
                    res.json({message: errorMessage, success: false});
                }
            );
    }
}
