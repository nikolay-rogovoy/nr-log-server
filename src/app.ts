"use strict"

import {create} from 'domain';
import {getLogger} from './libs/logger';
import {AddRoutesError} from './add-routes-error';
import {Server} from './server';

(function main() {

    /***/
    let logger = getLogger(module);

    logger.debug('run app main()');

    let serverDomain = create();
    serverDomain.on('error',
        (err) => {
            if (err instanceof AddRoutesError) {
                logger.debug(`serverDomain: Ошибка: ${err.name}\nсообщение: ${err.message}\n${err.stack}`);
            }
            else {
                logger.debug(`serverDomain: Ошибка: ${err.name}\nсообщение: ${err.message}\n${err.stack}`);
            }
        }
    );

    // Запуск сервера
    serverDomain.run(
        () => {
            new Server();
        });

})();
