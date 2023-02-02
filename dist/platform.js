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
exports.TuyaPlatform = void 0;
const jsonschema_1 = require("jsonschema");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const TuyaDeviceManager_1 = __importDefault(require("./device/TuyaDeviceManager"));
const TuyaCustomDeviceManager_1 = __importDefault(require("./device/TuyaCustomDeviceManager"));
const TuyaHomeDeviceManager_1 = __importDefault(require("./device/TuyaHomeDeviceManager"));
const settings_1 = require("./settings");
const config_1 = require("./config");
const AccessoryFactory_1 = __importDefault(require("./accessory/AccessoryFactory"));
const TuyaOpenAPI_1 = __importStar(require("./core/TuyaOpenAPI"));
/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
class TuyaPlatform {
    validate(config) {
        let result;
        if (!config.options) {
            this.log.warn('Not configured, exit.');
            return false;
        }
        else if (config.options.projectType === '1') {
            result = new jsonschema_1.Validator().validate(config.options, config_1.customOptionsSchema);
        }
        else if (config.options.projectType === '2') {
            result = new jsonschema_1.Validator().validate(config.options, config_1.homeOptionsSchema);
        }
        else {
            this.log.warn(`Unsupported projectType: ${config.options.projectType}, exit.`);
            return false;
        }
        result.errors.forEach(error => this.log.error(error.stack));
        return result.errors.length === 0;
    }
    constructor(log, config, api) {
        this.log = log;
        this.config = config;
        this.api = api;
        this.Service = this.api.hap.Service;
        this.Characteristic = this.api.hap.Characteristic;
        this.options = this.config.options;
        // this is used to track restored cached accessories
        this.cachedAccessories = [];
        this.accessoryHandlers = [];
        if (!this.validate(config)) {
            return;
        }
        this.log.debug('Finished initializing platform');
        // When this event is fired it means Homebridge has restored all cached accessories from disk.
        // Dynamic Platform plugins should only register new accessories after this event was fired,
        // in order to ensure they weren't added to homebridge already. This event can also be used
        // to start discovery of new accessories.
        this.api.on('didFinishLaunching', async () => {
            log.debug('Executed didFinishLaunching callback');
            // run the method to discover / register your devices as accessories
            await this.initDevices();
        });
    }
    /**
     * This function is invoked when homebridge restores cached accessories from disk at startup.
     * It should be used to setup event handlers for characteristics and update respective values.
     */
    configureAccessory(accessory) {
        this.log.info('Loading accessory from cache:', accessory.displayName);
        // add the restored accessory to the accessories cache so we can track if it has already been registered
        this.cachedAccessories.push(accessory);
    }
    /**
     * This is an example method showing how to register discovered accessories.
     * Accessories must only be registered once, previously created accessories
     * must not be registered again to prevent "duplicate UUID" errors.
     */
    async initDevices() {
        let devices;
        if (this.options.projectType === '1') {
            devices = await this.initCustomProject();
        }
        else if (this.options.projectType === '2') {
            devices = await this.initHomeProject();
        }
        else {
            this.log.warn(`Unsupported projectType: ${this.config.options.projectType}.`);
        }
        if (!devices) {
            return;
        }
        this.log.info(`Got ${devices.length} device(s) and scene(s).`);
        const file = path_1.default.join(this.api.user.persistPath(), `TuyaDeviceList.${this.deviceManager.api.tokenInfo.uid}.json`);
        this.log.info('Device list saved at %s', file);
        if (!fs_1.default.existsSync(this.api.user.persistPath())) {
            await fs_1.default.promises.mkdir(this.api.user.persistPath());
        }
        await fs_1.default.promises.writeFile(file, JSON.stringify(devices, null, 2));
        // add accessories
        for (const device of devices) {
            this.addAccessory(device);
        }
        // remove unused accessories
        for (const cachedAccessory of this.cachedAccessories) {
            this.log.warn('Removing unused accessory from cache:', cachedAccessory.displayName);
            this.api.unregisterPlatformAccessories(settings_1.PLUGIN_NAME, settings_1.PLATFORM_NAME, [cachedAccessory]);
        }
        this.cachedAccessories = [];
        this.deviceManager.on(TuyaDeviceManager_1.default.Events.DEVICE_ADD, this.addAccessory.bind(this));
        this.deviceManager.on(TuyaDeviceManager_1.default.Events.DEVICE_INFO_UPDATE, this.updateAccessoryInfo.bind(this));
        this.deviceManager.on(TuyaDeviceManager_1.default.Events.DEVICE_STATUS_UPDATE, this.updateAccessoryStatus.bind(this));
        this.deviceManager.on(TuyaDeviceManager_1.default.Events.DEVICE_DELETE, this.removeAccessory.bind(this));
    }
    getDeviceConfig(device) {
        if (!this.options.deviceOverrides) {
            return undefined;
        }
        const deviceConfig = this.options.deviceOverrides.find(config => config.id === device.id || config.id === device.uuid);
        const productConfig = this.options.deviceOverrides.find(config => config.id === device.product_id);
        const globalConfig = this.options.deviceOverrides.find(config => config.id === 'global');
        return deviceConfig || productConfig || globalConfig;
    }
    getDeviceSchemaConfig(device, code) {
        const deviceConfig = this.getDeviceConfig(device);
        if (!deviceConfig || !deviceConfig.schema) {
            return undefined;
        }
        const schemaConfig = deviceConfig.schema.find(item => item.code === code);
        if (!schemaConfig) {
            return undefined;
        }
        return schemaConfig;
    }
    async initCustomProject() {
        if (this.options.projectType !== '1') {
            return null;
        }
        const DEFAULT_USER = 'homebridge';
        const DEFAULT_PASS = 'homebridge';
        let res;
        const { endpoint, accessId, accessKey } = this.options;
        const api = new TuyaOpenAPI_1.default(endpoint, accessId, accessKey, this.log);
        const deviceManager = new TuyaCustomDeviceManager_1.default(api);
        this.log.info('Get token.');
        res = await api.getToken();
        if (res.success === false) {
            this.log.error(`Get token failed. code=${res.code}, msg=${res.msg}`);
            return null;
        }
        this.log.info(`Search default user "${DEFAULT_USER}"`);
        res = await api.customGetUserInfo(DEFAULT_USER);
        if (res.success === false) {
            this.log.error(`Search user failed. code=${res.code}, msg=${res.msg}`);
            return null;
        }
        if (!res.result.user_name) {
            this.log.info(`Default user "${DEFAULT_USER}" not exist.`);
            this.log.info(`Creating default user "${DEFAULT_USER}".`);
            res = await api.customCreateUser(DEFAULT_USER, DEFAULT_PASS);
            if (res.success === false) {
                this.log.error(`Create default user failed. code=${res.code}, msg=${res.msg}`);
                return null;
            }
        }
        else {
            this.log.info(`Default user "${DEFAULT_USER}" exists.`);
        }
        const uid = res.result.user_id;
        this.log.info('Fetching asset list.');
        res = await deviceManager.getAssetList();
        if (res.success === false) {
            this.log.error(`Fetching asset list failed. code=${res.code}, msg=${res.msg}`);
            return null;
        }
        const assetIDList = [];
        for (const { asset_id, asset_name } of res.result.list) {
            this.log.info(`Got asset_id=${asset_id}, asset_name=${asset_name}`);
            assetIDList.push(asset_id);
        }
        if (assetIDList.length === 0) {
            this.log.warn('Asset list is empty. exit.');
            return null;
        }
        this.log.info('Authorize asset list.');
        res = await deviceManager.authorizeAssetList(uid, assetIDList, true);
        if (res.success === false) {
            this.log.error(`Authorize asset list failed. code=${res.code}, msg=${res.msg}`);
            return null;
        }
        this.log.info(`Log in with user "${DEFAULT_USER}".`);
        res = await api.customLogin(DEFAULT_USER, DEFAULT_USER);
        if (res.success === false) {
            this.log.error(`Login failed. code=${res.code}, msg=${res.msg}`);
            if (TuyaOpenAPI_1.LOGIN_ERROR_MESSAGES[res.code]) {
                this.log.error(TuyaOpenAPI_1.LOGIN_ERROR_MESSAGES[res.code]);
            }
            return null;
        }
        this.log.info('Start MQTT connection.');
        deviceManager.mq.start();
        this.log.info('Fetching device list.');
        deviceManager.ownerIDs = assetIDList;
        const devices = await deviceManager.updateDevices(assetIDList);
        this.deviceManager = deviceManager;
        return devices;
    }
    async initHomeProject() {
        if (this.options.projectType !== '2') {
            return null;
        }
        let res;
        const { accessId, accessKey, countryCode, username, password, appSchema } = this.options;
        const api = new TuyaOpenAPI_1.default(TuyaOpenAPI_1.default.Endpoints.AMERICA, accessId, accessKey, this.log);
        const deviceManager = new TuyaHomeDeviceManager_1.default(api);
        this.log.info('Log in to Tuya Cloud.');
        res = await api.homeLogin(countryCode, username, password, appSchema);
        if (res.success === false) {
            this.log.error(`Login failed. code=${res.code}, msg=${res.msg}`);
            if (TuyaOpenAPI_1.LOGIN_ERROR_MESSAGES[res.code]) {
                this.log.error(TuyaOpenAPI_1.LOGIN_ERROR_MESSAGES[res.code]);
            }
            return null;
        }
        this.log.info('Start MQTT connection.');
        deviceManager.mq.start();
        this.log.info('Fetching home list.');
        res = await deviceManager.getHomeList();
        if (res.success === false) {
            this.log.error(`Fetching home list failed. code=${res.code}, msg=${res.msg}`);
            return null;
        }
        const homeIDList = [];
        for (const { home_id, name } of res.result) {
            this.log.info(`Got home_id=${home_id}, name=${name}`);
            if (this.options.homeWhitelist) {
                if (this.options.homeWhitelist.includes(home_id)) {
                    this.log.info(`Found home_id=${home_id} in whitelist; including devices from this home.`);
                    homeIDList.push(home_id);
                }
                else {
                    this.log.info(`Did not find home_id=${home_id} in whitelist; excluding devices from this home.`);
                }
            }
            else {
                homeIDList.push(home_id);
            }
        }
        if (homeIDList.length === 0) {
            this.log.warn('Home list is empty.');
        }
        this.log.info('Fetching device list.');
        deviceManager.ownerIDs = homeIDList.map(homeID => homeID.toString());
        const devices = await deviceManager.updateDevices(homeIDList);
        this.log.info('Fetching scene list.');
        for (const homeID of homeIDList) {
            const scenes = await deviceManager.getSceneList(homeID);
            for (const scene of scenes) {
                this.log.info(`Got scene_id=${scene.id}, name=${scene.name}`);
            }
            devices.push(...scenes);
        }
        this.deviceManager = deviceManager;
        return devices;
    }
    addAccessory(device) {
        const deviceConfig = this.getDeviceConfig(device);
        if (deviceConfig === null || deviceConfig === void 0 ? void 0 : deviceConfig.category) {
            this.log.warn('Override %o category to %o', device.name, deviceConfig.category);
            device.category = deviceConfig.category;
            if (deviceConfig.category === 'hidden') {
                this.log.info('Hide Accessory:', device.name);
                return;
            }
        }
        const uuid = this.api.hap.uuid.generate(device.id);
        const existingAccessory = this.cachedAccessories.find(accessory => accessory.UUID === uuid);
        if (existingAccessory) {
            this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);
            // Update context
            if (!existingAccessory.context || !existingAccessory.context.deviceID) {
                this.log.info('Update accessory context:', existingAccessory.displayName);
                existingAccessory.context.deviceID = device.id;
                this.api.updatePlatformAccessories([existingAccessory]);
            }
            // create the accessory handler for the restored accessory
            const handler = AccessoryFactory_1.default.createAccessory(this, existingAccessory, device);
            this.accessoryHandlers.push(handler);
            const index = this.cachedAccessories.indexOf(existingAccessory);
            if (index >= 0) {
                this.cachedAccessories.splice(index, 1);
            }
        }
        else {
            // the accessory does not yet exist, so we need to create it
            this.log.info('Adding new accessory:', device.name);
            // create a new accessory
            const accessory = new this.api.platformAccessory(device.name, uuid);
            accessory.context.deviceID = device.id;
            // create the accessory handler for the newly create accessory
            const handler = AccessoryFactory_1.default.createAccessory(this, accessory, device);
            this.accessoryHandlers.push(handler);
            // link the accessory to your platform
            this.api.registerPlatformAccessories(settings_1.PLUGIN_NAME, settings_1.PLATFORM_NAME, [accessory]);
        }
    }
    updateAccessoryInfo(device, info) {
        const handler = this.getAccessoryHandler(device.id);
        if (!handler) {
            return;
        }
        // this.log.debug('onDeviceInfoUpdate devId = %s, status = %o}', device.id, info);
        handler.onDeviceInfoUpdate(info);
    }
    updateAccessoryStatus(device, status) {
        const handler = this.getAccessoryHandler(device.id);
        if (!handler) {
            return;
        }
        // this.log.debug('onDeviceStatusUpdate devId = %s, status = %o}', device.id, status);
        handler.onDeviceStatusUpdate(status);
    }
    removeAccessory(deviceID) {
        const handler = this.getAccessoryHandler(deviceID);
        if (!handler) {
            return;
        }
        const index = this.accessoryHandlers.indexOf(handler);
        if (index >= 0) {
            this.accessoryHandlers.splice(index, 1);
        }
        this.api.unregisterPlatformAccessories(settings_1.PLUGIN_NAME, settings_1.PLATFORM_NAME, [handler.accessory]);
        this.log.info('Removing existing accessory from cache:', handler.accessory.displayName);
    }
    getAccessoryHandler(deviceID) {
        return this.accessoryHandlers.find(handler => handler.device.id === deviceID);
    }
}
exports.TuyaPlatform = TuyaPlatform;
//# sourceMappingURL=platform.js.map