"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.homeOptionsSchema = exports.customOptionsSchema = void 0;
exports.customOptionsSchema = {
    properties: {
        endpoint: { type: 'string', format: 'url', required: true },
        accessId: { type: 'string', required: true },
        accessKey: { type: 'string', required: true },
        deviceOverrides: { 'type': 'array' },
    },
};
exports.homeOptionsSchema = {
    properties: {
        accessId: { type: 'string', required: true },
        accessKey: { type: 'string', required: true },
        countryCode: { 'type': 'integer', 'minimum': 1 },
        username: { type: 'string', required: true },
        password: { type: 'string', required: true },
        appSchema: { 'type': 'string', required: true },
        homeWhitelist: { 'type': 'array' },
        deviceOverrides: { 'type': 'array' },
    },
};
//# sourceMappingURL=config.js.map