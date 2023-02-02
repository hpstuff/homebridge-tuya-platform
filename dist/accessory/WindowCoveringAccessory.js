"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../util/util");
const BaseAccessory_1 = __importDefault(require("./BaseAccessory"));
const SCHEMA_CODE = {
    CURRENT_POSITION: ['percent_state'],
    TARGET_POSITION_CONTROL: ['control', 'mach_operate'],
    TARGET_POSITION_PERCENT: ['percent_control', 'position'],
    // POSITION_STATE: ['work_state'],
    // conflit in different products, see: https://github.com/0x5e/homebridge-tuya-platform/issues/179#issuecomment-1367922879
    // REVERSE_MODE: ['control_back_mode', 'control_back'],
};
class WindowCoveringAccessory extends BaseAccessory_1.default {
    requiredSchema() {
        return [SCHEMA_CODE.TARGET_POSITION_CONTROL];
    }
    configureServices() {
        this.configureCurrentPosition();
        this.configurePositionState();
        if (this.getSchema(...SCHEMA_CODE.TARGET_POSITION_PERCENT)) {
            this.configureTargetPositionPercent();
        }
        else {
            this.configureTargetPositionControl();
        }
    }
    mainService() {
        return this.accessory.getService(this.Service.WindowCovering)
            || this.accessory.addService(this.Service.WindowCovering);
    }
    configureCurrentPosition() {
        const currentSchema = this.getSchema(...SCHEMA_CODE.CURRENT_POSITION);
        const targetSchema = this.getSchema(...SCHEMA_CODE.TARGET_POSITION_PERCENT);
        const targetControlSchema = this.getSchema(...SCHEMA_CODE.TARGET_POSITION_CONTROL);
        this.mainService().getCharacteristic(this.Characteristic.CurrentPosition)
            .onGet(() => {
            if (currentSchema) {
                const status = this.getStatus(currentSchema.code);
                return (0, util_1.limit)(status.value, 0, 100);
            }
            else if (targetSchema) {
                const status = this.getStatus(targetSchema.code);
                return (0, util_1.limit)(status.value, 0, 100);
            }
            const status = this.getStatus(targetControlSchema.code);
            if (status.value === 'close' || status.value === 'FZ') {
                return 0;
            }
            else if (status.value === 'stop' || status.value === 'STOP') {
                return 50;
            }
            else if (status.value === 'open' || status.value === 'ZZ') {
                return 100;
            }
            this.log.warn('Unknown CurrentPosition:', status.value);
            return 50;
        });
    }
    configurePositionState() {
        const currentSchema = this.getSchema(...SCHEMA_CODE.CURRENT_POSITION);
        const targetSchema = this.getSchema(...SCHEMA_CODE.TARGET_POSITION_PERCENT);
        const { DECREASING, INCREASING, STOPPED } = this.Characteristic.PositionState;
        this.mainService().getCharacteristic(this.Characteristic.PositionState)
            .onGet(() => {
            if (!currentSchema || !targetSchema) {
                return STOPPED;
            }
            const currentStatus = this.getStatus(currentSchema.code);
            const targetStatus = this.getStatus(targetSchema.code);
            if (targetStatus.value === 100 && currentStatus.value !== 100) {
                return INCREASING;
            }
            else if (targetStatus.value === 0 && currentStatus.value !== 0) {
                return DECREASING;
            }
            else {
                return STOPPED;
            }
        });
    }
    configureTargetPositionPercent() {
        const schema = this.getSchema(...SCHEMA_CODE.TARGET_POSITION_PERCENT);
        if (!schema) {
            return;
        }
        this.mainService().getCharacteristic(this.Characteristic.TargetPosition)
            .onGet(() => {
            const status = this.getStatus(schema.code);
            return (0, util_1.limit)(status.value, 0, 100);
        })
            .onSet(value => {
            this.sendCommands([{ code: schema.code, value: value }], true);
        });
    }
    configureTargetPositionControl() {
        const schema = this.getSchema(...SCHEMA_CODE.TARGET_POSITION_CONTROL);
        if (!schema) {
            return;
        }
        const isOldSchema = !schema.property.range.includes('open');
        this.mainService().getCharacteristic(this.Characteristic.TargetPosition)
            .onGet(() => {
            const status = this.getStatus(schema.code);
            if (status.value === 'close' || status.value === 'FZ') {
                return 0;
            }
            else if (status.value === 'stop' || status.value === 'STOP') {
                return 50;
            }
            else if (status.value === 'open' || status.value === 'ZZ') {
                return 100;
            }
            this.log.warn('Unknown TargetPosition:', status.value);
            return 50;
        })
            .onSet(value => {
            let control;
            if (value === 0) {
                control = isOldSchema ? 'FZ' : 'close';
            }
            else if (value === 100) {
                control = isOldSchema ? 'ZZ' : 'open';
            }
            else {
                control = isOldSchema ? 'STOP' : 'stop';
            }
            this.sendCommands([{ code: schema.code, value: control }], true);
        })
            .setProps({
            minStep: 50,
        });
    }
}
exports.default = WindowCoveringAccessory;
//# sourceMappingURL=WindowCoveringAccessory.js.map