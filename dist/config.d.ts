import { PlatformConfig } from 'homebridge';
import { TuyaDeviceSchemaProperty, TuyaDeviceSchemaType } from './device/TuyaDevice';
export interface TuyaPlatformDeviceSchemaConfig {
    oldCode: string;
    code: string;
    type: TuyaDeviceSchemaType;
    property: TuyaDeviceSchemaProperty;
    onGet: string;
    onSet: string;
}
export interface TuyaPlatformDeviceConfig {
    id: string;
    category: string;
    schema: Array<TuyaPlatformDeviceSchemaConfig>;
}
export interface TuyaPlatformCustomConfigOptions {
    projectType: '1';
    endpoint: string;
    accessId: string;
    accessKey: string;
    username: string;
    password: string;
    deviceOverrides: Array<TuyaPlatformDeviceConfig>;
}
export interface TuyaPlatformHomeConfigOptions {
    projectType: '2';
    accessId: string;
    accessKey: string;
    countryCode: number;
    username: string;
    password: string;
    appSchema: string;
    homeWhitelist: Array<number>;
    deviceOverrides: Array<TuyaPlatformDeviceConfig>;
}
export type TuyaPlatformConfigOptions = TuyaPlatformCustomConfigOptions | TuyaPlatformHomeConfigOptions;
export interface TuyaPlatformConfig extends PlatformConfig {
    options: TuyaPlatformConfigOptions;
}
export declare const customOptionsSchema: {
    properties: {
        endpoint: {
            type: string;
            format: string;
            required: boolean;
        };
        accessId: {
            type: string;
            required: boolean;
        };
        accessKey: {
            type: string;
            required: boolean;
        };
        deviceOverrides: {
            type: string;
        };
    };
};
export declare const homeOptionsSchema: {
    properties: {
        accessId: {
            type: string;
            required: boolean;
        };
        accessKey: {
            type: string;
            required: boolean;
        };
        countryCode: {
            type: string;
            minimum: number;
        };
        username: {
            type: string;
            required: boolean;
        };
        password: {
            type: string;
            required: boolean;
        };
        appSchema: {
            type: string;
            required: boolean;
        };
        homeWhitelist: {
            type: string;
        };
        deviceOverrides: {
            type: string;
        };
    };
};
//# sourceMappingURL=config.d.ts.map