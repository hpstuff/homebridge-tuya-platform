/// <reference types="node" />
import EventEmitter from 'events';
import TuyaOpenAPI from '../core/TuyaOpenAPI';
import TuyaOpenMQ from '../core/TuyaOpenMQ';
import Logger from '../util/Logger';
import TuyaDevice, { TuyaDeviceSchema, TuyaDeviceStatus } from './TuyaDevice';
declare enum Events {
    DEVICE_ADD = "DEVICE_ADD",
    DEVICE_INFO_UPDATE = "DEVICE_INFO_UPDATE",
    DEVICE_STATUS_UPDATE = "DEVICE_STATUS_UPDATE",
    DEVICE_DELETE = "DEVICE_DELETE"
}
declare enum TuyaMQTTProtocol {
    DEVICE_STATUS_UPDATE = 4,
    DEVICE_INFO_UPDATE = 20
}
export default class TuyaDeviceManager extends EventEmitter {
    api: TuyaOpenAPI;
    static readonly Events: typeof Events;
    mq: TuyaOpenMQ;
    ownerIDs: string[];
    devices: TuyaDevice[];
    log: Logger;
    constructor(api: TuyaOpenAPI);
    getDevice(deviceID: string): TuyaDevice | undefined;
    updateDevices(ownerIDs: []): Promise<TuyaDevice[]>;
    updateDevice(deviceID: string): Promise<TuyaDevice | null>;
    getDeviceInfo(deviceID: string): Promise<import("../core/TuyaOpenAPI").TuyaOpenAPIResponse>;
    getDeviceListInfo(deviceIDs?: string[]): Promise<import("../core/TuyaOpenAPI").TuyaOpenAPIResponse>;
    getDeviceSchema(deviceID: string): Promise<TuyaDeviceSchema[]>;
    sendCommands(deviceID: string, commands: TuyaDeviceStatus[]): Promise<any>;
    onMQTTMessage(topic: string, protocol: TuyaMQTTProtocol, message: any): Promise<void>;
}
export {};
//# sourceMappingURL=TuyaDeviceManager.d.ts.map