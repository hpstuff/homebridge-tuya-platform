"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const TuyaDevice_1 = require("../device/TuyaDevice");
const BaseAccessory_1 = __importDefault(require("./BaseAccessory"));
class SceneSwitchAccessory extends BaseAccessory_1.default {
    configureServices() {
        const schema = this.device.schema.filter((schema) => schema.code.startsWith('switch') && schema.type === TuyaDevice_1.TuyaDeviceSchemaType.Boolean);
        for (const _schema of schema) {
            const name = (schema.length === 1) ? this.device.name : _schema.code;
            this.configureSwitch(_schema, name);
        }
    }
    configureSwitch(schema, name) {
        if (!schema) {
            return;
        }
        const service = this.accessory.getService(schema.code)
            || this.accessory.addService(this.Service.Switch, name, schema.code);
        service.setCharacteristic(this.Characteristic.Name, name);
        if (!service.testCharacteristic(this.Characteristic.ConfiguredName)) {
            service.addOptionalCharacteristic(this.Characteristic.ConfiguredName); // silence warning
            service.setCharacteristic(this.Characteristic.ConfiguredName, name);
        }
        const suffix = schema.code.replace('switch', '');
        const modeSchema = this.getSchema('mode' + suffix);
        service.getCharacteristic(this.Characteristic.On)
            .onGet(() => {
            const status = this.getStatus(schema.code);
            return status.value;
        })
            .onSet((value) => {
            if (modeSchema) {
                const mode = this.getStatus(modeSchema.code);
                if (mode.value.startsWith('scene')) {
                    this.sendCommands([{ code: schema.code, value: false }]);
                    return;
                }
            }
            this.sendCommands([{ code: schema.code, value: value }]);
        });
    }
}
exports.default = SceneSwitchAccessory;
//# sourceMappingURL=SceneSwitchAccessory.js.map