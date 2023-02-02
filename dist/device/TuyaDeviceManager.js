"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = __importDefault(require("events"));
const TuyaOpenMQ_1 = __importDefault(require("../core/TuyaOpenMQ"));
const Logger_1 = require("../util/Logger");
const TuyaDevice_1 = __importStar(require("./TuyaDevice"));
var Events;
(function (Events) {
    Events["DEVICE_ADD"] = "DEVICE_ADD";
    Events["DEVICE_INFO_UPDATE"] = "DEVICE_INFO_UPDATE";
    Events["DEVICE_STATUS_UPDATE"] = "DEVICE_STATUS_UPDATE";
    Events["DEVICE_DELETE"] = "DEVICE_DELETE";
})(Events || (Events = {}));
var TuyaMQTTProtocol;
(function (TuyaMQTTProtocol) {
    TuyaMQTTProtocol[TuyaMQTTProtocol["DEVICE_STATUS_UPDATE"] = 4] = "DEVICE_STATUS_UPDATE";
    TuyaMQTTProtocol[TuyaMQTTProtocol["DEVICE_INFO_UPDATE"] = 20] = "DEVICE_INFO_UPDATE";
})(TuyaMQTTProtocol || (TuyaMQTTProtocol = {}));
class TuyaDeviceManager extends events_1.default {
    constructor(api) {
        super();
        this.api = api;
        this.ownerIDs = [];
        this.devices = [];
        const log = this.api.log.log;
        this.log = new Logger_1.PrefixLogger(log, TuyaDeviceManager.name);
        this.mq = new TuyaOpenMQ_1.default(api, log);
        this.mq.addMessageListener(this.onMQTTMessage.bind(this));
    }
    getDevice(deviceID) {
        return Array.from(this.devices).find(device => device.id === deviceID);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async updateDevices(ownerIDs) {
        return [];
    }
    async updateDevice(deviceID) {
        const res = await this.getDeviceInfo(deviceID);
        if (!res.success) {
            return null;
        }
        const device = new TuyaDevice_1.default(res.result);
        device.schema = await this.getDeviceSchema(deviceID);
        const oldDevice = this.getDevice(deviceID);
        if (oldDevice) {
            this.devices.splice(this.devices.indexOf(oldDevice), 1);
        }
        this.devices.push(device);
        return device;
    }
    async getDeviceInfo(deviceID) {
        const res = await this.api.get(`/v1.0/devices/${deviceID}`);
        return res;
    }
    async getDeviceListInfo(deviceIDs = []) {
        const res = await this.api.get('/v1.0/devices', { 'device_ids': deviceIDs.join(',') });
        return res;
    }
    async getDeviceSchema(deviceID) {
        // const res = await this.api.get(`/v1.2/iot-03/devices/${deviceID}/specification`);
        const res = await this.api.get(`/v1.0/devices/${deviceID}/specifications`);
        if (res.success === false) {
            this.log.warn('Get device specification failed. devId = %s, code = %s, msg = %s', deviceID, res.code, res.msg);
            return [];
        }
        // Combine functions and status together, as it used to be.
        const schemas = new Map();
        for (const { code, type: rawType, values: rawValues } of [...res.result.status, ...res.result.functions]) {
            if (schemas[code]) {
                continue;
            }
            // Transform IR device's special schema.
            const type = {
                'BOOLEAN': TuyaDevice_1.TuyaDeviceSchemaType.Boolean,
                'ENUM': TuyaDevice_1.TuyaDeviceSchemaType.Integer,
                'STRING': TuyaDevice_1.TuyaDeviceSchemaType.Enum,
            }[rawType] || rawType;
            const values = (rawType === 'STRING') ? JSON.stringify({ range: [rawValues] }) : rawValues;
            const read = (res.result.status).find(schema => schema.code === code) !== undefined;
            const write = (res.result.functions).find(schema => schema.code === code) !== undefined;
            let mode = TuyaDevice_1.TuyaDeviceSchemaMode.UNKNOWN;
            if (read && write) {
                mode = TuyaDevice_1.TuyaDeviceSchemaMode.READ_WRITE;
            }
            else if (read && !write) {
                mode = TuyaDevice_1.TuyaDeviceSchemaMode.READ_ONLY;
            }
            else if (!read && write) {
                mode = TuyaDevice_1.TuyaDeviceSchemaMode.WRITE_ONLY;
            }
            let property;
            try {
                property = JSON.parse(values);
                schemas[code] = { code, mode, type, property };
            }
            catch (error) {
                this.log.error(error);
            }
        }
        return Object.values(schemas).sort((a, b) => a.code > b.code ? 1 : -1);
    }
    async sendCommands(deviceID, commands) {
        const res = await this.api.post(`/v1.0/devices/${deviceID}/commands`, { commands });
        return res.result;
    }
    async onMQTTMessage(topic, protocol, message) {
        switch (protocol) {
            case TuyaMQTTProtocol.DEVICE_STATUS_UPDATE: {
                const { devId, status } = message;
                const device = this.getDevice(devId);
                if (!device) {
                    return;
                }
                for (const item of device.status) {
                    const _item = status.find(_item => _item.code === item.code);
                    if (!_item) {
                        continue;
                    }
                    item.value = _item.value;
                }
                this.emit(Events.DEVICE_STATUS_UPDATE, device, status);
                break;
            }
            case TuyaMQTTProtocol.DEVICE_INFO_UPDATE: {
                const { bizCode, bizData, devId } = message;
                if (bizCode === 'bindUser') {
                    const { ownerId } = bizData;
                    if (!this.ownerIDs.includes(ownerId)) {
                        this.log.warn('Update devId = %s not included in your ownerIDs. Skip.', devId);
                        return;
                    }
                    // TODO failed if request to quickly
                    await new Promise(resolve => setTimeout(resolve, 10000));
                    const device = await this.updateDevice(devId);
                    if (!device) {
                        return;
                    }
                    this.mq.start(); // Force reconnect, unless new device status update won't get received
                    this.emit(Events.DEVICE_ADD, device);
                }
                else if (bizCode === 'nameUpdate') {
                    const { name } = bizData;
                    const device = this.getDevice(devId);
                    if (!device) {
                        return;
                    }
                    device.name = name;
                    this.emit(Events.DEVICE_INFO_UPDATE, device, bizData);
                }
                else if (bizCode === 'online' || bizCode === 'offline') {
                    const device = this.getDevice(devId);
                    if (!device) {
                        return;
                    }
                    device.online = (bizCode === 'online') ? true : false;
                    this.emit(Events.DEVICE_INFO_UPDATE, device, bizData);
                }
                else if (bizCode === 'delete') {
                    const { ownerId } = bizData;
                    if (!this.ownerIDs.includes(ownerId)) {
                        this.log.warn('Remove devId = %s not included in your ownerIDs. Skip.', devId);
                        return;
                    }
                    const device = this.getDevice(devId);
                    if (!device) {
                        return;
                    }
                    this.devices.splice(this.devices.indexOf(device), 1);
                    this.emit(Events.DEVICE_DELETE, devId);
                }
                else if (bizCode === 'event_notify') {
                    // doorbell event
                }
                else if (bizCode === 'p2pSignal') {
                    // p2p signal
                }
                else {
                    this.log.warn('Unhandled mqtt message: bizCode = %s, bizData = %o', bizCode, bizData);
                }
                break;
            }
            default:
                this.log.warn('Unhandled mqtt message: protocol = %s, message = %o', protocol, message);
                break;
        }
    }
}
exports.default = TuyaDeviceManager;
TuyaDeviceManager.Events = Events;
//# sourceMappingURL=TuyaDeviceManager.js.map