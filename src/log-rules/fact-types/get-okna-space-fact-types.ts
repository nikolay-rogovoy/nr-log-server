import {IFactattribtype, IFacttype} from "nr-log-parser";
import {IFactattrib} from "nr-log-parser/i-factattrib";
import {IFact} from "nr-log-parser/i-fact";

/***/
function startController(regExp: RegExp, line: string, name: string): IFact {
    let regExpResult;
    while (regExpResult = regExp.exec(line)) {
        let id = regExpResult[1];
        let entityName = regExpResult[2];
        let start = new Date(regExpResult[3]);
        return <IFact>{
            start,
            name: name,
            end: null,
            factattrib: [
                <IFactattrib> {
                    name: 'id',
                    value: id
                },
                <IFactattrib> {
                    name: entityName,
                    value: entityName
                }
            ]
        };
    }
    return null
}

/***/
function endController(regExpErr: RegExp, regExp: RegExp, line: string, fact: IFact, name: string): Date {
    // Завершилось с ошибкой
    let error = errorController(regExpErr, line, fact, name);
    if (error) {
        return error;
    } else {
        // Сохранение выполнено успешно
        let regExpResult;
        while (regExpResult = regExp.exec(line)) {
            let id = regExpResult[1];
            let end = new Date(regExpResult[2]);
            if (fact.name === name) {
                if (fact.factattrib.find(x => x.name === 'id').value === id) {
                    return end;
                }
            }
        }
        return null
    }
}

/***/
function errorController(regExpErr: RegExp, line: string, fact: IFact, name: string): Date {
    // Завершилось с ошибкой
    let regExpResult;
    while (regExpResult = regExpErr.exec(line)) {
        let id = regExpResult[1];
        let error = regExpResult[2];
        let end = new Date(regExpResult[3]);
        if (fact.name === name) {
            if (fact.factattrib.find(x => x.name === 'id').value === id) {
                fact.factattrib.push(<IFactattrib> {
                    name: 'error',
                    value: error
                });
                return end;
            }
        }
    }
}

/***/
function endControllerWithLen(regExpErr: RegExp, regExp: RegExp, line: string, fact: IFact, name: string): Date {
    // Завершилось с ошибкой
    let error = errorController(regExpErr, line, fact, name);
    if (error) {
        return error;
    } else {
        // Сохранение выполнено успешно
        let regExpResult;
        while (regExpResult = regExp.exec(line)) {
            let id = regExpResult[1];
            let length = regExpResult[2];
            let end = new Date(regExpResult[3]);
            if (fact.name === name) {
                if (fact.factattrib.find(x => x.name === 'id').value === id) {
                    fact.factattrib.push(<IFactattrib> {
                        name: 'length',
                        value: length
                    });
                    return end;
                }
            }
        }
        return null
    }
}

function poolAttrib(regExp: RegExp, line: string, fact: IFact, name: string): IFactattrib {
    let regExpResult;
    while (regExpResult = regExp.exec(line)) {
        let waitingCount = Number.parseInt(regExpResult[1]);
        let idleCount = Number.parseInt(regExpResult[2]);
        let totalCount = Number.parseInt(regExpResult[3]);
        if (fact.name === name) {
            if (fact.factattrib.find(x => x.name === 'poll state') == null) {
                return <IFactattrib>{
                    date: fact.start,
                    name: 'poll state',
                    value: `waitingCount = (${waitingCount}); idleCount = (${idleCount}); totalCount = (${totalCount})`,
                };
            }
        }
    }
    return null;
}

/***/
function getSaveDataControllerFactTypes(): IFacttype {
    const name = 'save-data-controller';
    return <IFacttype> {
        name: name,
        check: (line: string): IFact => {
            return startController(
                /{"level":"debug","message":"{\\"id\\":(\d+),\\"message\\":\\"handleRoutes -> post \/(\w+)\\"}","label":"save-data-controller\.js","timestamp":"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/g,
                line, name);
        },
        checkEnd: (line: string, fact: IFact) => {
            return endController(/{"level":"error","message":"{\\"id\\":(\d+),\\"message\\":{\\"error\\":\\"([\w\W]+)"}}","label":"save-data-controller\.js","timestamp":"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/g,
                /{"level":"debug","message":"{\\"id\\":(\d+),\\"message\\":\\"Сохранение выполнено успешно\\"}","label":"save-data-controller\.js","timestamp":"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/g,
                line, fact, name
            );
        },
        factattribtypes: [
            <IFactattribtype>{
                name: 'poll state',
                check: (line: string, fact: IFact) => {
                    return poolAttrib(/^\d+ connect: waitingCount = (\d+); idleCount = (\d+); totalCount = (\d+)/g,
                        line, fact, name);
                }
            }
        ]
    }
}

/***/
function getGetController(): IFacttype {
    const name = 'get-controller';
    return <IFacttype> {
        name: name,
        check: (line: string): IFact => {
            return startController(
                /{"level":"debug","message":"{\\"id\\":(\d+),\\"message\\":\\"handleRoutes get \/(\w+)\/:id\w+\\"}","label":"get-controller\.js","timestamp":"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/g,
                line, name);
        },
        checkEnd: (line: string, fact: IFact) => {
            return endController(/{"level":"error","message":"{\\"id\\":(\d+),\\"message\\":{\\"error\\":\\"(.+)\\"}}","label":"get-controller\.js","timestamp":"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/g,
                /{"level":"debug","message":"{\\"id\\":(\d+),\\"message\\":\\"Successful\\"}","label":"get-controller\.js","timestamp":"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/g,
                line, fact, name
            );
        },
        factattribtypes: [
            <IFactattribtype>{
                name: 'poll state',
                check: (line: string, fact: IFact) => {
                    return poolAttrib(/^\d+ connect: waitingCount = (\d+); idleCount = (\d+); totalCount = (\d+)/g,
                        line, fact, name);
                }
            }
        ]
    }
}

/***/
function getGetListController(): IFacttype {
    const name = 'get-list-controller';
    return <IFacttype> {
        name: name,
        check: (line: string): IFact => {
            return startController(
                /{"level":"debug","message":"{\\"id\\":(\d+),\\"message\\":\\"handleRoutes get \/(\w+)\\"}","label":"get-list-controller\.js","timestamp":"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/g,
                line, name);
        },
        checkEnd: (line: string, fact: IFact) => {
            return endControllerWithLen(/{"level":"error","message":"{\\"id\\":(\d+),\\"message\\":{\\"error\\":\\"(.+)\\"}}","label":"get-list-controller\.js","timestamp":"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/g,
                /{"level":"debug","message":"{\\"id\\":(\d+),\\"message\\":{\\"result\\":\\"Successful\\",\\"length\\":(\d+)}}","label":"get-list-controller\.js","timestamp":"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/g,
                line, fact, name
            );
        },
        factattribtypes: [
            <IFactattribtype>{
                name: 'poll state',
                check: (line: string, fact: IFact) => {
                    return poolAttrib(/^\d+ connect: waitingCount = (\d+); idleCount = (\d+); totalCount = (\d+)/g,
                        line, fact, name);
                }
            }
        ]
    }
}

/***/
function getGetOnFieldBetweenController(): IFacttype {
    const name = 'get-on-field-between-controller';
    return <IFacttype> {
        name: name,
        check: (line: string): IFact => {
            let regExp = /{"level":"debug","message":"{\\"id\\":(\d+),\\"message\\":\\"handleRoutes get \/(\w+)\/(\w+)\/([\w\d]+)\/([\w\d]+)\\"}","label":"get-on-field-between-controller\.js","timestamp":"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/g;
            let regExpResult;
            while (regExpResult = regExp.exec(line)) {
                let id = regExpResult[1];
                let entityName = regExpResult[2];
                let fieldName = regExpResult[3];
                let beginFieldValue = regExpResult[4];
                let endFieldValue = regExpResult[5];
                let start = new Date(regExpResult[6]);
                return <IFact>{
                    start,
                    name: name,
                    end: null,
                    factattrib: [
                        <IFactattrib> {
                            name: 'id',
                            value: id
                        },
                        <IFactattrib> {
                            name: entityName,
                            value: entityName
                        },
                        <IFactattrib> {
                            name: 'fieldName',
                            value: fieldName
                        },
                        <IFactattrib> {
                            name: 'beginFieldValue',
                            value: beginFieldValue
                        },
                        <IFactattrib> {
                            name: 'endFieldValue',
                            value: endFieldValue
                        }
                    ]
                };
            }
            return null;
        },
        checkEnd: (line: string, fact: IFact) => {
            return endControllerWithLen(/{"level":"error","message":"{\\"id\\":(\d+),\\"message\\":{\\"error\\":\\"(.+)\\"}}","label":"get-on-field-between-controller\.js","timestamp":"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/g,
                /{"level":"debug","message":"{\\"id\\":(\d+),\\"message\\":{\\"result\\":\\"Successful\\",\\"length\\":(\d+)}}","label":"get-on-field-between-controller\.js","timestamp":"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/g,
                line, fact, name
            );
        },
        factattribtypes: [
            <IFactattribtype>{
                name: 'poll state',
                check: (line: string, fact: IFact) => {
                    return poolAttrib(/^\d+ connect: waitingCount = (\d+); idleCount = (\d+); totalCount = (\d+)/g,
                        line, fact, name);
                }
            }
        ]
    }
}

/***/
function getGetOnFieldController(): IFacttype {
    const name = 'get-on-field-controller';
    return <IFacttype> {
        name: name,
        check: (line: string): IFact => {
            let regExp = /{"level":"debug","message":"{\\"id\\":(\d+),\\"message\\":\\"handleRoutes get \/(\w+)\/(\w+)\/([\w\d]+)\\"}","label":"get-on-field-controller\.js","timestamp":"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/g;
            let regExpResult;
            while (regExpResult = regExp.exec(line)) {
                let id = regExpResult[1];
                let entityName = regExpResult[2];
                let fieldName = regExpResult[3];
                let fieldValue = regExpResult[4];
                let start = new Date(regExpResult[5]);
                return <IFact>{
                    start,
                    name: name,
                    end: null,
                    factattrib: [
                        <IFactattrib> {
                            name: 'id',
                            value: id
                        },
                        <IFactattrib> {
                            name: entityName,
                            value: entityName
                        },
                        <IFactattrib> {
                            name: 'fieldName',
                            value: fieldName
                        },
                        <IFactattrib> {
                            name: 'fieldValue',
                            value: fieldValue
                        }
                    ]
                };
            }
            return null;
        },
        checkEnd: (line: string, fact: IFact) => {
            return endControllerWithLen(/{"level":"error","message":"{\\"id\\":(\d+),\\"message\\":{\\"error\\":\\"(.+)\\"}}","label":"get-on-field-controller\.js","timestamp":"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/g,
                /{"level":"debug","message":"{\\"id\\":(\d+),\\"message\\":{\\"result\\":\\"Successful\\",\\"length\\":(\d+)}}","label":"get-on-field-controller\.js","timestamp":"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/g,
                line, fact, name
            );
        },
        factattribtypes: [
            <IFactattribtype>{
                name: 'poll state',
                check: (line: string, fact: IFact) => {
                    return poolAttrib(/^\d+ connect: waitingCount = (\d+); idleCount = (\d+); totalCount = (\d+)/g,
                        line, fact, name);
                }
            }
        ]
    }
}

/***/
function getGetOnFilterController(): IFacttype {
    const name = 'get-on-filter-controller';
    return <IFacttype> {
        name: name,
        check: (line: string): IFact => {
            let regExp = /{"level":"debug","message":"{\\"id\\":(\d+),\\"message\\":\\"handleRoutes get \/(\w+)\/filter\/:([\w\d]+)\/:([\w\d]+)\\"}","label":"get-on-filter-controller\.js","timestamp":"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/g;
            let regExpResult;
            while (regExpResult = regExp.exec(line)) {
                let id = regExpResult[1];
                let entityName = regExpResult[2];
                let idDepartment = regExpResult[3];
                let idGroup = regExpResult[4];
                let start = new Date(regExpResult[5]);
                return <IFact>{
                    start,
                    name: name,
                    end: null,
                    factattrib: [
                        <IFactattrib> {
                            name: 'id',
                            value: id
                        },
                        <IFactattrib> {
                            name: entityName,
                            value: entityName
                        },
                        <IFactattrib> {
                            name: 'idDepartment',
                            value: idDepartment
                        },
                        <IFactattrib> {
                            name: 'idGroup',
                            value: idGroup
                        }
                    ]
                };
            }
            return null;
        },
        checkEnd: (line: string, fact: IFact) => {
            return endControllerWithLen(/{"level":"error","message":"{\\"id\\":(\d+),\\"message\\":{\\"error\\":\\"(.+)\\"}}","label":"get-on-filter-controller\.js","timestamp":"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/g,
                /{"level":"debug","message":"{\\"id\\":(\d+),\\"message\\":{\\"result\\":\\"Successful\\",\\"length\\":(\d+)}}","label":"get-on-filter-controller\.js","timestamp":"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/g,
                line, fact, name
            );
        },
        factattribtypes: [
            <IFactattribtype>{
                name: 'poll state',
                check: (line: string, fact: IFact) => {
                    return poolAttrib(/^\d+ connect: waitingCount = (\d+); idleCount = (\d+); totalCount = (\d+)/g,
                        line, fact, name);
                }
            }
        ]
    }
}

/***/
function getSetPhoneRecordController(): IFacttype {
    const name = 'set-phone-record-controller';
    return <IFacttype> {
        name: name,
        check: (line: string): IFact => {
            let regExp = /{"level":"debug","message":"{\\"id\\":(\d+),\\"message\\":\\"handleRoutes \/setphonerecord\/:([\w\d]+)\\"}","label":"set-phone-record-controller\.js","timestamp":"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/g;
            let regExpResult;
            while (regExpResult = regExp.exec(line)) {
                let id = regExpResult[1];
                let idDepartment = regExpResult[2];
                let start = new Date(regExpResult[3]);
                return <IFact>{
                    start,
                    name: name,
                    end: null,
                    factattrib: [
                        <IFactattrib> {
                            name: 'id',
                            value: id
                        },
                        <IFactattrib> {
                            name: 'idDepartment',
                            value: idDepartment
                        },
                    ]
                };
            }
            return null;
        },
        checkEnd: (line: string, fact: IFact) => {
            return endController(/{"level":"error","message":"{\\"id\\":(\d+),\\"message\\":{\\"error\\":\\"(.+)\\"}}","label":"set-phone-record-controller\.js","timestamp":"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/g,
                /{"level":"debug","message":"{\\"id\\":(\d+),\\"message\\":\\"Successful\\"}","label":"set-phone-record-controller\.js","timestamp":"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/g,
                line, fact, name
            );
        },
        factattribtypes: [
            <IFactattribtype>{
                name: 'poll state',
                check: (line: string, fact: IFact) => {
                    return poolAttrib(/^\d+ connect: waitingCount = (\d+); idleCount = (\d+); totalCount = (\d+)/g,
                        line, fact, name);
                }
            }
        ]
    }
}

/***/
function getDatasourceController(): IFacttype {
    const name = 'datasource-controller';
    return <IFacttype> {
        name: name,
        check: (line: string): IFact => {
            let regExp = /{"level":"debug","message":"{\\"id\\":(\d+),\\"message\\":\\"handleRoutes -> post \/filldatasource\/:([\w\d]+)\\"}","label":"datasource-controller\.js","timestamp":"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/g;
            let regExpResult;
            while (regExpResult = regExp.exec(line)) {
                let id = regExpResult[1];
                let idDatasource = regExpResult[2];
                let start = new Date(regExpResult[3]);
                return <IFact>{
                    start,
                    name: name,
                    end: null,
                    factattrib: [
                        <IFactattrib> {
                            name: 'id',
                            value: id
                        },
                        <IFactattrib> {
                            name: 'idDatasource',
                            value: idDatasource
                        },
                    ]
                };
            }
            return null;
        },
        checkEnd: (line: string, fact: IFact) => {
            return endController(/{"level":"error","message":"{\\"id\\":(\d+),\\"message\\":{\\"error\\":\\"(.+)\\"}}","label":"datasource-controller\.js","timestamp":"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/g,
                /{"level":"debug","message":"{\\"id\\":(\d+),\\"message\\":\\"Successful\\"}","label":"datasource-controller\.js","timestamp":"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/g,
                line, fact, name
            );
        },
        factattribtypes: [
            <IFactattribtype>{
                name: 'poll state',
                check: (line: string, fact: IFact) => {
                    return poolAttrib(/^\d+ connect: waitingCount = (\d+); idleCount = (\d+); totalCount = (\d+)/g,
                        line, fact, name);
                }
            },
            <IFactattribtype>{
                name: 'param',
                check: (line: string, fact: IFact) => {
                    let regExp = /{"level":"debug","message":"{\\"id\\":(\d+),\\"message\\":\\"Параметры запроса: (.+)\\"}","label":"datasource-controller\.js","timestamp":"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/g;
                    let regExpResult;
                    while (regExpResult = regExp.exec(line)) {
                        let id = regExpResult[1];
                        let param = regExpResult[2];
                        let date = new Date(regExpResult[3]);
                        if (fact.name === name) {
                            if (fact.factattrib.find(x => x.name === 'id').value === id) {
                                return <IFactattrib>{
                                    date: date,
                                    name: 'param',
                                    value: param,
                                };
                            }
                        }
                    }
                    return null
                }
            },
        ]
    }
}

/***/
function geCalcCustomerdocnumController(): IFacttype {
    const name = 'calc-customerdocnum-controller';
    return <IFacttype> {
        name: name,
        check: (line: string): IFact => {
            let regExp = /{"level":"debug","message":"{\\"id\\":(\d+),\\"message\\":\\"handleRoutes get \/calc_customerdocnum\/([\d\w]+)\/([\d\w]+)\\"}","label":"calc-customerdocnum-controller\.js","timestamp":"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/g;
            let regExpResult;
            while (regExpResult = regExp.exec(line)) {
                let id = regExpResult[1];
                let idCustomer = regExpResult[2];
                let idCustomerDepartment = regExpResult[3];
                let start = new Date(regExpResult[4]);
                return <IFact>{
                    start,
                    name: name,
                    end: null,
                    factattrib: [
                        <IFactattrib> {
                            name: 'id',
                            value: id
                        },
                        <IFactattrib> {
                            name: 'idCustomer',
                            value: idCustomer
                        },
                        <IFactattrib> {
                            name: 'idCustomerDepartment',
                            value: idCustomerDepartment
                        },
                    ]
                };
            }
            return null;
        },
        checkEnd: (line: string, fact: IFact) => {
            return endController(/{"level":"error","message":"{\\"id\\":(\d+),\\"message\\":{\\"error\\":\\"(.+)\\"}}","label":"calc-customerdocnum-controller\.js","timestamp":"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/g,
                /{"level":"debug","message":"{\\"id\\":(\d+),\\"message\\":\\"Successful\\"}","label":"calc-customerdocnum-controller\.js","timestamp":"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/g,
                line, fact, name
            );
        },
        factattribtypes: [
            <IFactattribtype>{
                name: 'poll state',
                check: (line: string, fact: IFact) => {
                    return poolAttrib(/^\d+ connect: waitingCount = (\d+); idleCount = (\d+); totalCount = (\d+)/g,
                        line, fact, name);
                }
            }
        ]
    }
}

/***/
function getDeleteController(): IFacttype {
    const name = 'delete-controller';
    return <IFacttype> {
        name: name,
        check: (line: string): IFact => {
            let regExp = /{"level":"debug","message":"{\\"id\\":(\d+),\\"message\\":\\"handleRoutes delete \/([\d\w]+)\/:([\d\w]+)\\"}","label":"delete-controller\.js","timestamp":"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/g;
            let regExpResult;
            while (regExpResult = regExp.exec(line)) {
                let id = regExpResult[1];
                let idEntity = regExpResult[2];
                let start = new Date(regExpResult[3]);
                return <IFact>{
                    start,
                    name: name,
                    end: null,
                    factattrib: [
                        <IFactattrib> {
                            name: 'id',
                            value: id
                        },
                        <IFactattrib> {
                            name: 'idEntity',
                            value: idEntity
                        },
                    ]
                };
            }
            return null;
        },
        checkEnd: (line: string, fact: IFact) => {
            return endController(/{"level":"error","message":"{\\"id\\":(\d+),\\"message\\":{\\"error\\":\\"(.+)\\"}}","label":"delete-controller\.js","timestamp":"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/g,
                /{"level":"debug","message":"{\\"id\\":(\d+),\\"message\\":\\"Successful\\"}","label":"delete-controller\.js","timestamp":"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/g,
                line, fact, name
            );
        },
        factattribtypes: [
            <IFactattribtype>{
                name: 'poll state',
                check: (line: string, fact: IFact) => {
                    return poolAttrib(/^\d+ connect: waitingCount = (\d+); idleCount = (\d+); totalCount = (\d+)/g,
                        line, fact, name);
                }
            }
        ]
    }
}

/***/
function getDeleteArrayController(): IFacttype {
    const name = 'delete-array-controller';
    return <IFacttype> {
        name: name,
        check: (line: string): IFact => {
            let regExp = /{"level":"debug","message":"{\\"id\\":(\d+),\\"message\\":\\"handleRoutes -> post \/appealdialog\/delete\\"}","label":"delete-array-controller\.js","timestamp":"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/g;
            let regExpResult;
            while (regExpResult = regExp.exec(line)) {
                let id = regExpResult[1];
                let start = new Date(regExpResult[2]);
                return <IFact>{
                    start,
                    name: name,
                    end: null,
                    factattrib: [
                        <IFactattrib> {
                            name: 'id',
                            value: id
                        }
                    ]
                };
            }
            return null;
        },
        checkEnd: (line: string, fact: IFact) => {
            return endController(/{"level":"error","message":"{\\"id\\":(\d+),\\"message\\":{\\"error\\":\\"(.+)\\"}}","label":"delete-array-controller\.js","timestamp":"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/g,
                /{"level":"debug","message":"{\\"id\\":(\d+),\\"message\\":\\"Successful\\"}","label":"delete-array-controller\.js","timestamp":"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/g,
                line, fact, name
            );
        },
        factattribtypes: [
            <IFactattribtype>{
                name: 'poll state',
                check: (line: string, fact: IFact) => {
                    return poolAttrib(/^\d+ connect: waitingCount = (\d+); idleCount = (\d+); totalCount = (\d+)/g,
                        line, fact, name);
                }
            },
            <IFactattribtype>{
                name: 'param',
                check: (line: string, fact: IFact) => {
                    let regExp = /{"level":"debug","message":"{\\"id\\":(\d+),\\"message\\":(.+)}","label":"delete-array-controller\.js","timestamp":"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/g;
                    let regExpResult;
                    while (regExpResult = regExp.exec(line)) {
                        let id = regExpResult[1];
                        let param = regExpResult[2];
                        let date = new Date(regExpResult[3]);
                        if (fact.name === name) {
                            if (fact.factattrib.find(x => x.name === 'id').value === id) {
                                return <IFactattrib>{
                                    date: date,
                                    name: 'param',
                                    value: param,
                                };
                            }
                        }
                    }
                    return null
                }
            },
        ]
    }
}

/***/
function getDocrelationController(): IFacttype {
    const name = 'docrelation-controller';
    return <IFacttype> {
        name: name,
        check: (line: string): IFact => {
            let regExp = /{"level":"debug","message":"{\\"id\\":(\d+),\\"message\\":\\"handleRoutes \/docrelation\/:(\d+)\/:(\w+)\\"}","label":"docrelation-controller\.js","timestamp":"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/g;
            let regExpResult;
            while (regExpResult = regExp.exec(line)) {
                let id = regExpResult[1];
                let idEntity = regExpResult[2];
                let entityName = regExpResult[3];
                let start = new Date(regExpResult[4]);
                return <IFact>{
                    start,
                    name: name,
                    end: null,
                    factattrib: [
                        <IFactattrib> {
                            name: 'id',
                            value: id
                        },
                        <IFactattrib> {
                            name: 'idEntity',
                            value: idEntity
                        },
                        <IFactattrib> {
                            name: 'entityName',
                            value: entityName
                        }
                    ]
                };
            }
            return null;
        },
        checkEnd: (line: string, fact: IFact) => {
            return endController(/{"level":"error","message":"{\\"id\\":(\d+),\\"message\\":{\\"error\\":\\"(.+)\\"}}","label":"docrelation-controller\.js","timestamp":"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/g,
                /{"level":"debug","message":"{\\"id\\":(\d+),\\"message\\":\\"Successful\\"}","label":"docrelation-controller\.js","timestamp":"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/g,
                line, fact, name
            );
        },
        factattribtypes: [
            <IFactattribtype>{
                name: 'poll state',
                check: (line: string, fact: IFact) => {
                    return poolAttrib(/^\d+ connect: waitingCount = (\d+); idleCount = (\d+); totalCount = (\d+)/g,
                        line, fact, name);
                }
            }
        ]
    }
}

/***/
function getGetAppealsourceEfficientController(): IFacttype {
    const name = 'get-appealsource-efficient-controller';
    return <IFacttype> {
        name: name,
        check: (line: string): IFact => {
            let regExp = /{"level":"debug","message":"{\\"id\\":(\d+),\\"message\\":\\"handleRoutes get \/appeal_source_efficient\\"}","label":"get-appealsource-efficient-controller\.js","timestamp":"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/g;
            let regExpResult;
            while (regExpResult = regExp.exec(line)) {
                let id = regExpResult[1];
                let start = new Date(regExpResult[2]);
                return <IFact>{
                    start,
                    name: name,
                    end: null,
                    factattrib: [
                        <IFactattrib> {
                            name: 'id',
                            value: id
                        }
                    ]
                };
            }
            return null;
        },
        checkEnd: (line: string, fact: IFact) => {
            return endController(/{"level":"error","message":"{\\"id\\":(\d+),\\"message\\":{\\"error\\":\\"(.+)\\"}}","label":"get-appealsource-efficient-controller\.js","timestamp":"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/g,
                /{"level":"debug","message":"{\\"id\\":(\d+),\\"message\\":\\"Successful\\"}","label":"get-appealsource-efficient-controller\.js","timestamp":"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/g,
                line, fact, name
            );
        },
        factattribtypes: [
            <IFactattribtype>{
                name: 'poll state',
                check: (line: string, fact: IFact) => {
                    return poolAttrib(/^\d+ connect: waitingCount = (\d+); idleCount = (\d+); totalCount = (\d+)/g,
                        line, fact, name);
                }
            }
        ]
    }
}

/***/
function getSearchFilterController(): IFacttype {
    const name = 'search-filter-controller';
    return <IFacttype> {
        name: name,
        check: (line: string): IFact => {
            let regExp = /{"level":"debug","message":"{\\"id\\":(\d+),\\"message\\":\\"handleRoutes \/search\/:(.+)"}","label":"search-filter-controller\.js","timestamp":"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/g;
            let regExpResult;
            while (regExpResult = regExp.exec(line)) {
                let id = regExpResult[1];
                let searchString = regExpResult[2];
                let start = new Date(regExpResult[3]);
                return <IFact>{
                    start,
                    name: name,
                    end: null,
                    factattrib: [
                        <IFactattrib> {
                            name: 'id',
                            value: id
                        },
                        <IFactattrib> {
                            name: 'searchString',
                            value: searchString
                        }
                    ]
                };
            }
            return null;
        },
        checkEnd: (line: string, fact: IFact) => {
            return endControllerWithLen(/{"level":"error","message":"{\\"id\\":(\d+),\\"message\\":{\\"error\\":\\"(.+)\\"}}","label":"search-filter-controller\.js","timestamp":"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/g,
                /{"level":"debug","message":"{\\"id\\":(\d+),\\"message\\":{\\"result\\":\\"Successful\\",\\"length\\":(\d+)}}","label":"search-filter-controller\.js","timestamp":"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/g,
                line, fact, name
            );
        },
        factattribtypes: [
            <IFactattribtype>{
                name: 'poll state',
                check: (line: string, fact: IFact) => {
                    return poolAttrib(/^\d+ connect: waitingCount = (\d+); idleCount = (\d+); totalCount = (\d+)/g,
                        line, fact, name);
                }
            }
        ]
    }
}

/***/
export function getOknaSpaceFactTypes(): IFacttype[] {
    return [
        getSaveDataControllerFactTypes(),
        getGetController(),
        getGetListController(),
        getGetOnFieldBetweenController(),
        getGetOnFieldController(),
        getGetOnFilterController(),
        getSetPhoneRecordController(),
        getDatasourceController(),
        geCalcCustomerdocnumController(),
        getDeleteController(),
        getDeleteArrayController(),
        getDocrelationController(),
        getGetAppealsourceEfficientController(),
        getSearchFilterController()
    ]
}
