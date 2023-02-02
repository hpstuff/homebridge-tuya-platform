export default interface Logger {
    info(message?: any, ...args: any[]): void;
    warn(message?: any, ...args: any[]): void;
    debug(message?: any, ...args: any[]): void;
    error(message?: any, ...args: any[]): void;
}
export declare class PrefixLogger {
    log: Logger;
    prefix: string;
    constructor(log: Logger, prefix: string);
    info(message?: any, ...args: any[]): void;
    warn(message?: any, ...args: any[]): void;
    error(message?: any, ...args: any[]): void;
    debug(message?: any, ...args: any[]): void;
}
//# sourceMappingURL=Logger.d.ts.map