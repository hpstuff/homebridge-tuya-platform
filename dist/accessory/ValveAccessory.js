"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const TuyaDevice_1 = require("../device/TuyaDevice");
const BaseAccessory_1 = __importDefault(require("./BaseAccessory"));
const Active_1 = require("./characteristic/Active");
const SCHEMA_CODE = {
    ON: ['switch', 'switch_1'],
};
class ValveAccessory extends BaseAccessory_1.default {
    requiredSchema() {
        return [SCHEMA_CODE.ON];
    }
    configureServices() {
        const oldService = this.accessory.getService(this.Service.Valve);
        if (oldService && (oldService === null || oldService === void 0 ? void 0 : oldService.subtype) === undefined) {
            this.platform.log.warn('Remove old service:', oldService.UUID);
            this.accessory.removeService(oldService);
        }
        const schema = this.device.schema.filter((schema) => schema.code.startsWith('switch') && schema.type === TuyaDevice_1.TuyaDeviceSchemaType.Boolean);
        for (const _schema of schema) {
            const name = (schema.length === 1) ? this.device.name : _schema.code;
            this.configureValve(_schema, name);
        }
    }
    configureValve(schema, name) {
        const service = this.accessory.getService(schema.code)
            || this.accessory.addService(this.Service.Valve, name, schema.code);
        service.setCharacteristic(this.Characteristic.Name, name);
        if (!service.testCharacteristic(this.Characteristic.ConfiguredName)) {
            service.addOptionalCharacteristic(this.Characteristic.ConfiguredName); // silence warning
            service.setCharacteristic(this.Characteristic.ConfiguredName, name);
        }
        service.setCharacteristic(this.Characteristic.ValveType, this.Characteristic.ValveType.IRRIGATION);
        const { NOT_IN_USE, IN_USE } = this.Characteristic.InUse;
        service.getCharacteristic(this.Characteristic.InUse)
            .onGet(() => {
            const status = this.getStatus(schema.code);
            return status.value ? IN_USE : NOT_IN_USE;
        });
        (0, Active_1.configureActive)(this, service, schema);
    }
}
exports.default = ValveAccessory;
//# sourceMappingURL=ValveAccessory.js.map