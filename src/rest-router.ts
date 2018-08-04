import {getLogger} from './libs/logger';
import {Router} from 'express-serve-static-core';
import {TestController} from "./controllers/test-controller";
import {TextLogController} from "./controllers/text-log-controller";
import {IModel} from "./models/i-model";
import {LoginController} from "./controllers/login-controller";
import {Mongoose} from "mongoose";
import {GetLogController} from "./controllers/get-log-controller";

/**Класс обработки маршрутов*/
export class RestRouter {

    /***/
    logger = getLogger(module);

    /*
     * Используемые коды ответа HTTP
     *
     * 200 OK — успешный запрос. Если клиентом были запрошены какие-либо данные, то они находятся в заголовке и/или теле сообщения.
     * 201 Created — в результате успешного выполнения запроса был создан новый ресурс.
     *               Сервер может указать адреса (их может быть несколько) созданного ресурса в теле ответа, при этом предпочтительный
     *               адрес указывается в заголовке Location. Серверу рекомендуется указывать в теле ответа характеристики созданного
     *               ресурса и его адреса, формат тела ответа определяется заголовком Content-Type.
     *
     * 400 Bad Request — сервер обнаружил в запросе клиента синтаксическую ошибку.
     * 401 Unauthorized — для доступа к запрашиваемому ресурсу требуется аутентификация.
     *               В заголовке ответ должен содержать поле WWW-Authenticate с перечнем условий аутентификации. Клиент может повторить
     *               запрос, включив в заголовок сообщения поле Authorization с требуемыми для аутентификации данными.
     * 404 Not Found — основная причина — ошибка в написании адреса Web-страницы. Сервер понял запрос, но не нашёл соответствующего
     *               ресурса по указанному URI. Если серверу известно, что по этому адресу был документ, то ему желательно использовать
     *               код 410.
     * 424 Failed Dependency - реализация текущего запроса может зависеть от успешности выполнения другой операции.
     *               Если она не выполнена и из-за этого нельзя выполнить текущий запрос, то сервер вернёт этот код.
     *
     * 500 Internal Server Error — любая внутренняя ошибка сервера, которая не входит в рамки остальных ошибок класса.
     *
     *
     * */

    constructor(public model: IModel, public mongoose: Mongoose) {
    }

    async handleRoutes(router: Router) {

        this.logger.debug("handleRoutes -> start");

        let cnt = null;

        // todo Добавить фабрику контролеров

        //
        cnt = new TestController(this.model, this.mongoose);
        router.get('/test', cnt.handler.bind(cnt));

        //
        cnt = new TextLogController(this.model);
        router.post('/textlog', cnt.handler.bind(cnt));

        //
        cnt = new LoginController(this.model);
        router.post('/login', cnt.handler.bind(cnt));

        //
        cnt = new GetLogController(this.model);
        router.get('/getlog/:start/:end', cnt.handler.bind(cnt));

        this.logger.debug("handleRoutes <- end");
    }
}
