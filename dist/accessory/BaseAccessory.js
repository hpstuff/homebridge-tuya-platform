"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const debounce_1 = require("debounce");
const TuyaDevice_1 = require("../device/TuyaDevice");
const util_1 = require("../util/util");
const Logger_1 = require("../util/Logger");
const MANUFACTURER = 'Tuya Inc.';
const SCHEMA_CODE = {
    BATTERY_STATE: ['battery_state'],
    BATTERY_PERCENT: ['battery_percentage', 'residual_electricity', 'wireless_electricity', 'va_battery', 'battery'],
    BATTERY_CHARGING: ['charge_state'],
};
/**
 * Homebridge Accessory Categories Documentation:
 *   https://developers.homebridge.io/#/categories
 * Tuya Standard Instruction Set Documentation:
 *   https://developer.tuya.com/en/docs/iot/standarddescription?id=K9i5ql6waswzq
 */
class BaseAccessory {
    constructor(platform, accessory) {
        this.platform = platform;
        this.accessory = accessory;
        this.Service = this.platform.api.hap.Service;
        this.Characteristic = this.platform.api.hap.Characteristic;
        this.deviceManager = this.platform.deviceManager;
        this.device = this.deviceManager.getDevice(this.accessory.context.deviceID);
        this.log = new Logger_1.PrefixLogger(this.platform.log, this.device.name.length > 0 ? this.device.name : this.device.id);
        this.intialized = false;
        this.sendQueue = new Map();
        this.debounceSendCommands = (0, debounce_1.debounce)(async () => {
            const commands = [...this.sendQueue.values()];
            if (commands.length === 0) {
                return;
            }
            await this.deviceManager.sendCommands(this.device.id, commands);
            this.sendQueue.clear();
        }, 100);
        this.addAccessoryInfoService();
        this.addBatteryService();
    }
    addAccessoryInfoService() {
        const service = this.accessory.getService(this.Service.AccessoryInformation)
            || this.accessory.addService(this.Service.AccessoryInformation);
        service
            .setCharacteristic(this.Characteristic.Manufacturer, MANUFACTURER)
            .setCharacteristic(this.Characteristic.Model, this.device.product_id)
            .setCharacteristic(this.Characteristic.Name, this.device.name)
            .setCharacteristic(this.Characteristic.ConfiguredName, this.device.name)
            .setCharacteristic(this.Characteristic.SerialNumber, this.device.uuid);
    }
    addBatteryService() {
        const percentSchema = this.getSchema(...SCHEMA_CODE.BATTERY_PERCENT);
        if (!percentSchema) {
            return;
        }
        const { BATTERY_LEVEL_NORMAL, BATTERY_LEVEL_LOW } = this.Characteristic.StatusLowBattery;
        const service = this.accessory.getService(this.Service.Battery)
            || this.accessory.addService(this.Service.Battery);
        const stateSchema = this.getSchema(...SCHEMA_CODE.BATTERY_STATE);
        if (stateSchema || percentSchema) {
            service.getCharacteristic(this.Characteristic.StatusLowBattery)
                .onGet(() => {
                if (stateSchema) {
                    const status = this.getStatus(stateSchema.code);
                    return (status.value === 'low') ? BATTERY_LEVEL_LOW : BATTERY_LEVEL_NORMAL;
                }
                // fallback
                const status = this.getStatus(percentSchema.code);
                return (status.value <= 20) ? BATTERY_LEVEL_LOW : BATTERY_LEVEL_NORMAL;
            });
        }
        service.getCharacteristic(this.Characteristic.BatteryLevel)
            .onGet(() => {
            const status = this.getStatus(percentSchema.code);
            return (0, util_1.limit)(status.value, 0, 100);
        });
        const chargingSchema = this.getSchema(...SCHEMA_CODE.BATTERY_CHARGING);
        if (chargingSchema) {
            const { NOT_CHARGING, CHARGING } = this.Characteristic.ChargingState;
            service.getCharacteristic(this.Characteristic.ChargingState)
                .onGet(() => {
                const status = this.getStatus(chargingSchema.code);
                return status.value ? CHARGING : NOT_CHARGING;
            });
        }
    }
    configureStatusActive() {
        for (const service of this.accessory.services) {
            if (!service.testCharacteristic(this.Characteristic.StatusActive)) { // silence warning
                service.addOptionalCharacteristic(this.Characteristic.StatusActive);
            }
            service.getCharacteristic(this.Characteristic.StatusActive)
                .onGet(() => this.device.online);
        }
    }
    async updateAllValues() {
        for (const service of this.accessory.services) {
            for (const characteristic of service.characteristics) {
                const getHandler = characteristic['getHandler'];
                const newValue = getHandler ? (await getHandler()) : characteristic.value;
                if (characteristic.value === newValue) {
                    continue;
                }
                this.log.debug('[%s/%s/%s] Update value: %o => %o', service.constructor.name, service.subtype, characteristic.constructor.name, characteristic.value, newValue);
                characteristic.updateValue(newValue);
            }
        }
    }
    getSchema(...codes) {
        for (const code of codes) {
            const schema = this.device.schema.find(schema => schema.code === code);
            if (!schema) {
                continue;
            }
            // Readable schema must have a status
            if ([TuyaDevice_1.TuyaDeviceSchemaMode.READ_WRITE, TuyaDevice_1.TuyaDeviceSchemaMode.READ_ONLY].includes(schema.mode)
                && !this.getStatus(schema.code)) {
                continue;
            }
            return schema;
        }
        return undefined;
    }
    getStatus(code) {
        return this.device.status.find(status => status.code === code);
    }
    async sendCommands(commands, debounce = false) {
        if (commands.length === 0) {
            return;
        }
        commands = commands.filter((status) => status.code && status.value !== undefined);
        if (this.device.online === false) {
            this.log.warn('Device is offline, skip send command.');
            this.updateAllValues();
            return;
        }
        // Update cache immediately
        for (const newStatus of commands) {
            const oldStatus = this.device.status.find(_status => _status.code === newStatus.code);
            if (oldStatus) {
                oldStatus.value = newStatus.value;
            }
        }
        if (debounce === false) {
            return await this.deviceManager.sendCommands(this.device.id, commands);
        }
        for (const newStatus of commands) {
            // Update send queue
            this.sendQueue.set(newStatus.code, newStatus);
        }
        this.debounceSendCommands();
    }
    checkRequirements() {
        let result = true;
        for (const codes of this.requiredSchema()) {
            const schema = this.getSchema(...codes);
            if (schema) {
                continue;
            }
            this.log.warn('Product Category: %s', this.device.category);
            this.log.warn('Missing one of the required schema: %s', codes);
            this.log.warn('Please switch device control mode to "DP Insctrution", and set `deviceOverrides` manually.');
            this.log.warn('Detail information: https://github.com/0x5e/homebridge-tuya-platform#faq');
            result = false;
        }
        if (!result) {
            this.log.warn('Existing schema: %o', this.device.schema);
        }
        return result;
    }
    requiredSchema() {
        return [];
    }
    configureServices() {
        //
    }
    async onDeviceInfoUpdate(info) {
        this.updateAllValues();
    }
    async onDeviceStatusUpdate(status) {
        this.updateAllValues();
    }
}
// Overriding getSchema, getStatus, sendCommands
class OverridedBaseAccessory extends BaseAccessory {
    constructor() {
        super(...arguments);
        this.eval = (script, device, value) => eval(script);
    }
    getOverridedSchema(code) {
        const schemaConfig = this.platform.getDeviceSchemaConfig(this.device, code);
        if (!schemaConfig) {
            return undefined;
        }
        const oldSchema = this.device.schema.find(schema => schema.code === schemaConfig.oldCode);
        if (!oldSchema) {
            return undefined;
        }
        const schema = {
            code,
            mode: oldSchema.mode,
            type: schemaConfig.type || oldSchema.type,
            property: schemaConfig.property || oldSchema.property,
        };
        this.log.debug('Override schema %o => %o', oldSchema, schema);
        return schema;
    }
    getSchema(...codes) {
        for (const code of codes) {
            const schema = this.getOverridedSchema(code) || super.getSchema(code);
            if (!schema) {
                continue;
            }
            return schema;
        }
        return undefined;
    }
    getOverridedStatus(code) {
        const schemaConfig = this.platform.getDeviceSchemaConfig(this.device, code);
        if (!schemaConfig) {
            return undefined;
        }
        const originalStatus = super.getStatus(schemaConfig.oldCode);
        if (!originalStatus) {
            return undefined;
        }
        const status = { code: schemaConfig.code, value: originalStatus.value };
        if (schemaConfig.onGet) {
            status.value = this.eval(schemaConfig.onGet, this.device, originalStatus.value);
        }
        this.log.debug('Override status %o => %o', originalStatus, status);
        return status;
    }
    getStatus(code) {
        return this.getOverridedStatus(code) || super.getStatus(code);
    }
    async sendCommands(commands, debounce) {
        // convert to original commands
        for (const command of commands) {
            const schemaConfig = this.platform.getDeviceSchemaConfig(this.device, command.code);
            if (!schemaConfig) {
                continue;
            }
            const originalCommand = { code: schemaConfig.oldCode, value: command.value };
            if (schemaConfig.onSet) {
                originalCommand.value = this.eval(schemaConfig.onSet, this.device, command.value);
            }
            this.log.debug('Override command %o => %o', command, originalCommand);
            command.code = originalCommand.code;
            command.value = originalCommand.value;
        }
        super.sendCommands(commands, debounce);
    }
}
exports.default = OverridedBaseAccessory;
//# sourceMappingURL=BaseAccessory.js.map