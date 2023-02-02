"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrefixLogger = void 0;
class PrefixLogger {
    constructor(log, prefix) {
        this.log = log;
        this.prefix = prefix;
    }
    info(message, ...args) {
        this.log.info((this.prefix ? `[${this.prefix}] ` : '') + message, ...args);
    }
    warn(message, ...args) {
        this.log.warn((this.prefix ? `[${this.prefix}] ` : '') + message, ...args);
    }
    error(message, ...args) {
        this.log.error((this.prefix ? `[${this.prefix}] ` : '') + message, ...args);
    }
    debug(message, ...args) {
        this.log.debug((this.prefix ? `[${this.prefix}] ` : '') + message, ...args);
    }
}
exports.PrefixLogger = PrefixLogger;
//# sourceMappingURL=Logger.js.map