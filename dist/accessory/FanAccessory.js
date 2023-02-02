"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const TuyaDevice_1 = require("../device/TuyaDevice");
const BaseAccessory_1 = __importDefault(require("./BaseAccessory"));
const Active_1 = require("./characteristic/Active");
const Light_1 = require("./characteristic/Light");
const LockPhysicalControls_1 = require("./characteristic/LockPhysicalControls");
const On_1 = require("./characteristic/On");
const RotationSpeed_1 = require("./characteristic/RotationSpeed");
const SwingMode_1 = require("./characteristic/SwingMode");
const SCHEMA_CODE = {
    FAN_ON: ['switch_fan', 'fan_switch', 'switch'],
    FAN_DIRECTION: ['fan_direction'],
    FAN_SPEED: ['fan_speed'],
    FAN_SPEED_LEVEL: ['fan_speed_enum', 'fan_speed'],
    FAN_LOCK: ['child_lock'],
    FAN_SWING: ['switch_horizontal', 'switch_vertical'],
    LIGHT_ON: ['light', 'switch_led'],
    LIGHT_MODE: ['work_mode'],
    LIGHT_BRIGHT: ['bright_value', 'bright_value_v2'],
    LIGHT_TEMP: ['temp_value', 'temp_value_v2'],
    LIGHT_COLOR: ['colour_data'],
};
class FanAccessory extends BaseAccessory_1.default {
    requiredSchema() {
        return [SCHEMA_CODE.FAN_ON];
    }
    configureServices() {
        const serviceType = this.fanServiceType();
        if (serviceType === this.Service.Fan) {
            const unusedService = this.accessory.getService(this.Service.Fanv2);
            unusedService && this.accessory.removeService(unusedService);
            (0, On_1.configureOn)(this, this.fanService(), this.getSchema(...SCHEMA_CODE.FAN_ON));
        }
        else if (serviceType === this.Service.Fanv2) {
            const unusedService = this.accessory.getService(this.Service.Fan);
            unusedService && this.accessory.removeService(unusedService);
            (0, Active_1.configureActive)(this, this.fanService(), this.getSchema(...SCHEMA_CODE.FAN_ON));
            (0, LockPhysicalControls_1.configureLockPhysicalControls)(this, this.fanService(), this.getSchema(...SCHEMA_CODE.FAN_LOCK));
            (0, SwingMode_1.configureSwingMode)(this, this.fanService(), this.getSchema(...SCHEMA_CODE.FAN_SWING));
        }
        // Common Characteristics
        if (this.getFanSpeedSchema()) {
            (0, RotationSpeed_1.configureRotationSpeed)(this, this.fanService(), this.getFanSpeedSchema());
        }
        else if (this.getFanSpeedLevelSchema()) {
            (0, RotationSpeed_1.configureRotationSpeedLevel)(this, this.fanService(), this.getFanSpeedLevelSchema());
        }
        else {
            (0, RotationSpeed_1.configureRotationSpeedOn)(this, this.fanService(), this.getSchema(...SCHEMA_CODE.FAN_ON));
        }
        this.configureRotationDirection();
        // Light
        if (this.getSchema(...SCHEMA_CODE.LIGHT_ON)) {
            (0, Light_1.configureLight)(this, this.lightService(), this.getSchema(...SCHEMA_CODE.LIGHT_ON), this.getSchema(...SCHEMA_CODE.LIGHT_BRIGHT), this.getSchema(...SCHEMA_CODE.LIGHT_TEMP), this.getSchema(...SCHEMA_CODE.LIGHT_COLOR), this.getSchema(...SCHEMA_CODE.LIGHT_MODE));
        }
        else {
            this.log.warn('Remove Lightbulb Service...');
            const unusedService = this.accessory.getService(this.Service.Lightbulb);
            unusedService && this.accessory.removeService(unusedService);
        }
    }
    fanServiceType() {
        if (this.getSchema(...SCHEMA_CODE.FAN_LOCK)
            || this.getSchema(...SCHEMA_CODE.FAN_SWING)) {
            return this.Service.Fanv2;
        }
        return this.Service.Fan;
    }
    fanService() {
        const serviceType = this.fanServiceType();
        return this.accessory.getService(serviceType)
            || this.accessory.addService(serviceType);
    }
    lightService() {
        return this.accessory.getService(this.Service.Lightbulb)
            || this.accessory.addService(this.Service.Lightbulb);
    }
    getFanSpeedSchema() {
        const schema = this.getSchema(...SCHEMA_CODE.FAN_SPEED);
        if (schema && schema.type === TuyaDevice_1.TuyaDeviceSchemaType.Integer) {
            return schema;
        }
        return undefined;
    }
    getFanSpeedLevelSchema() {
        const schema = this.getSchema(...SCHEMA_CODE.FAN_SPEED_LEVEL);
        if (schema && schema.type === TuyaDevice_1.TuyaDeviceSchemaType.Enum) {
            return schema;
        }
        return undefined;
    }
    configureRotationDirection() {
        const schema = this.getSchema(...SCHEMA_CODE.FAN_DIRECTION);
        if (!schema) {
            return;
        }
        const { CLOCKWISE, COUNTER_CLOCKWISE } = this.Characteristic.RotationDirection;
        this.fanService().getCharacteristic(this.Characteristic.RotationDirection)
            .onGet(() => {
            const status = this.getStatus(schema.code);
            return (status.value !== 'reverse') ? CLOCKWISE : COUNTER_CLOCKWISE;
        })
            .onSet(value => {
            this.sendCommands([{ code: schema.code, value: (value === CLOCKWISE) ? 'forward' : 'reverse' }]);
        });
    }
}
exports.default = FanAccessory;
//# sourceMappingURL=FanAccessory.js.map