import {IFacttype, IStorage, LogParser} from "nr-log-parser";


export function getLogParser(id: string, facttypes: IFacttype[], storeges: IStorage[]): LogParser {
    const logParserMap = getLogParserMap();
    if (logParserMap.has(id)) {
        return logParserMap[id];
    } else {
        let parser = new LogParser(this.facttypes, storeges);
        logParserMap.set(id, parser);
    }
}

function getLogParserMap(): Map<string, LogParser> {
    const globalScope: any = global;
    if (globalScope.logParserMap) {
        return globalScope.logParserMap;
    } else {
        globalScope.logParserMap = new Map();
    }
}
