"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../util/util");
const BaseAccessory_1 = __importDefault(require("./BaseAccessory"));
const CurrentRelativeHumidity_1 = require("./characteristic/CurrentRelativeHumidity");
const CurrentTemperature_1 = require("./characteristic/CurrentTemperature");
const SCHEMA_CODE = {
    PM2_5: ['pm25_value'],
    PM10: ['pm10_value'],
    VOC: ['voc_value'],
    CURRENT_TEMP: ['va_temperature', 'temp_indoor'],
    CURRENT_HUMIDITY: ['va_humidity', 'humidity_value'],
};
class AirQualitySensorAccessory extends BaseAccessory_1.default {
    requiredSchema() {
        return [SCHEMA_CODE.PM2_5];
    }
    configureServices() {
        this.configureAirQuality();
        this.configurePM2_5Density();
        this.configurePM10Density();
        this.configureVOCDensity();
        // Other
        (0, CurrentTemperature_1.configureCurrentTemperature)(this, undefined, this.getSchema(...SCHEMA_CODE.CURRENT_TEMP));
        (0, CurrentRelativeHumidity_1.configureCurrentRelativeHumidity)(this, undefined, this.getSchema(...SCHEMA_CODE.CURRENT_HUMIDITY));
    }
    mainService() {
        return this.accessory.getService(this.Service.AirQualitySensor)
            || this.accessory.addService(this.Service.AirQualitySensor);
    }
    configureAirQuality() {
        const schema = this.getSchema(...SCHEMA_CODE.PM2_5);
        if (!schema) {
            return;
        }
        const { GOOD, FAIR, INFERIOR, POOR } = this.Characteristic.AirQuality;
        this.mainService().getCharacteristic(this.Characteristic.AirQuality)
            .onGet(() => {
            const status = this.getStatus(schema.code);
            const value = (0, util_1.limit)(status.value, 0, 1000);
            if (value <= 50) {
                return GOOD;
            }
            else if (value <= 100) {
                return FAIR;
            }
            else if (value <= 200) {
                return INFERIOR;
            }
            else {
                return POOR;
            }
        });
    }
    configurePM2_5Density() {
        const schema = this.getSchema(...SCHEMA_CODE.PM2_5);
        if (!schema) {
            return;
        }
        this.mainService().getCharacteristic(this.Characteristic.PM2_5Density)
            .onGet(() => {
            const status = this.getStatus(schema.code);
            const value = (0, util_1.limit)(status.value, 0, 1000);
            return value;
        });
    }
    configurePM10Density() {
        const schema = this.getSchema(...SCHEMA_CODE.PM10);
        if (!schema) {
            return;
        }
        this.mainService().getCharacteristic(this.Characteristic.PM10Density)
            .onGet(() => {
            const status = this.getStatus(schema.code);
            const value = (0, util_1.limit)(status.value, 0, 1000);
            return value;
        });
    }
    configureVOCDensity() {
        const schema = this.getSchema(...SCHEMA_CODE.VOC);
        if (!schema) {
            return;
        }
        this.mainService().getCharacteristic(this.Characteristic.VOCDensity)
            .onGet(() => {
            const status = this.getStatus(schema.code);
            const value = (0, util_1.limit)(status.value, 0, 1000);
            return value;
        });
    }
}
exports.default = AirQualitySensorAccessory;
//# sourceMappingURL=AirQualitySensorAccessory.js.map