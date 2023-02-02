"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseAccessory_1 = __importDefault(require("./BaseAccessory"));
const CurrentRelativeHumidity_1 = require("./characteristic/CurrentRelativeHumidity");
const CurrentTemperature_1 = require("./characteristic/CurrentTemperature");
const SCHEMA_CODE = {
    CURRENT_TEMP: ['va_temperature'],
    CURRENT_HUMIDITY: ['va_humidity', 'humidity_value'],
};
class TemperatureHumidityIRSensorAccessory extends BaseAccessory_1.default {
    requiredSchema() {
        return [];
    }
    configureServices() {
        (0, CurrentTemperature_1.configureCurrentTemperature)(this, undefined, this.getSchema(...SCHEMA_CODE.CURRENT_TEMP));
        (0, CurrentRelativeHumidity_1.configureCurrentRelativeHumidity)(this, undefined, this.getSchema(...SCHEMA_CODE.CURRENT_HUMIDITY));
    }
}
exports.default = TemperatureHumidityIRSensorAccessory;
//# sourceMappingURL=TemperatureHumidityIRSensorAccessory.js.map