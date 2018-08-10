import {IFacttype, IStorage, LogParser} from "nr-log-parser";
import config from "../config/config";


export function getLogParser(id: string, facttypes: IFacttype[], storeges: IStorage[]): LogParser {
    const logParserMap = getLogParserMap();
    if (!logParserMap.has(id)) {
        let parser = new LogParser(facttypes, storeges, config.get('log-parser:timeoutEndFact'));
        logParserMap.set(id, parser);
    }
    return logParserMap.get(id);
}

function getLogParserMap(): Map<string, LogParser> {
    const globalScope: any = global;
    if (globalScope.logParserMap == null) {
        globalScope.logParserMap = new Map();
    }
    return globalScope.logParserMap;
}
