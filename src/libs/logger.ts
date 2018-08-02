/***/
import * as winston from 'winston';

// const { combine, timestamp, label, printf } = format;
// const myFormat = printf(info => {
//     return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
// });

/***/
function getLabelModule(filename: string) {
    return filename.split('/').slice(-1).join('/');
}

/***/
export function getLogger(module: NodeModule) {

    /*
    let logger = createLogger({
        level: 'debug',
        format: combine(
            label({ label: labelModule }),
            timestamp(),
            myFormat
        ),
        transports: [
            new DailyRotateFile({ filename: 'logs/error.log', level: 'error' }),
            new DailyRotateFile({ filename: 'logs/debug.log' }),
            new transports.Console()
        ]
    });
    */
    return getLoggerInstance(module);
}

/***/
export function getTestLogger(module: NodeModule) {
    return getLoggerInstance(module, 'test');
}

/***/
function getLoggerInstance(module: NodeModule, loggerPref?: string) {
    if (!loggerPref) {
        loggerPref = '';
    }
    let labelModule = getLabelModule(module.filename);
    let logger = new winston.Logger({
        transports: [
            new winston.transports.File({
                name: 'error-file',
                filename: `logs/${loggerPref}error.log`,
                level: 'error',
                label: labelModule
            }),
            new winston.transports.File({
                name: 'warn-file',
                filename: `logs/${loggerPref}warn.log`,
                level: 'warn',
                label: labelModule
            }),
            new winston.transports.File({
                name: 'info-file',
                filename: `logs/${loggerPref}info.log`,
                level: 'info',
                label: labelModule,
                timestamp: true
            }),
            new winston.transports.File({
                name: 'debug-file',
                filename: `logs/${loggerPref}debug.log`,
                level: 'debug',
                label: labelModule,
                timestamp: true
            }),
            new winston.transports.Console({
                name: 'console',
                level: 'debug',
                label: labelModule,
                timestamp: true
            })
        ]
    });
    return logger;
}

/*

{ error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
{ emerg: 0, alert: 1, crit: 2, error: 3, warning: 4, notice: 5, info: 6, debug: 7 }


    logger.error("error");
    logger.warn('warn');
    logger.info('debug');
    logger.debug('debug');

*/
