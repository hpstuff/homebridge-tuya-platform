"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseAccessory_1 = __importDefault(require("./BaseAccessory"));
const LightAccessory_1 = __importDefault(require("./LightAccessory"));
const DimmerAccessory_1 = __importDefault(require("./DimmerAccessory"));
const OutletAccessory_1 = __importDefault(require("./OutletAccessory"));
const SwitchAccessory_1 = __importDefault(require("./SwitchAccessory"));
const WirelessSwitchAccessory_1 = __importDefault(require("./WirelessSwitchAccessory"));
const SceneSwitchAccessory_1 = __importDefault(require("./SceneSwitchAccessory"));
const FanAccessory_1 = __importDefault(require("./FanAccessory"));
const GarageDoorAccessory_1 = __importDefault(require("./GarageDoorAccessory"));
const WindowAccessory_1 = __importDefault(require("./WindowAccessory"));
const WindowCoveringAccessory_1 = __importDefault(require("./WindowCoveringAccessory"));
const ThermostatAccessory_1 = __importDefault(require("./ThermostatAccessory"));
const HeaterAccessory_1 = __importDefault(require("./HeaterAccessory"));
const ValveAccessory_1 = __importDefault(require("./ValveAccessory"));
const ContactSensorAccessory_1 = __importDefault(require("./ContactSensorAccessory"));
const LeakSensorAccessory_1 = __importDefault(require("./LeakSensorAccessory"));
const CarbonMonoxideSensorAccessory_1 = __importDefault(require("./CarbonMonoxideSensorAccessory"));
const CarbonDioxideSensorAccessory_1 = __importDefault(require("./CarbonDioxideSensorAccessory"));
const SmokeSensorAccessory_1 = __importDefault(require("./SmokeSensorAccessory"));
const TemperatureHumiditySensorAccessory_1 = __importDefault(require("./TemperatureHumiditySensorAccessory"));
const LightSensorAccessory_1 = __importDefault(require("./LightSensorAccessory"));
const MotionSensorAccessory_1 = __importDefault(require("./MotionSensorAccessory"));
const AirQualitySensorAccessory_1 = __importDefault(require("./AirQualitySensorAccessory"));
const HumanPresenceSensorAccessory_1 = __importDefault(require("./HumanPresenceSensorAccessory"));
const HumidifierAccessory_1 = __importDefault(require("./HumidifierAccessory"));
const DehumidifierAccessory_1 = __importDefault(require("./DehumidifierAccessory"));
const DiffuserAccessory_1 = __importDefault(require("./DiffuserAccessory"));
const AirPurifierAccessory_1 = __importDefault(require("./AirPurifierAccessory"));
const TemperatureHumidityIRSensorAccessory_1 = __importDefault(require("./TemperatureHumidityIRSensorAccessory"));
const CameraAccessory_1 = __importDefault(require("./CameraAccessory"));
const SceneAccessory_1 = __importDefault(require("./SceneAccessory"));
const AirConditionerAccessory_1 = __importDefault(require("./AirConditionerAccessory"));
class AccessoryFactory {
    static createAccessory(platform, accessory, device) {
        let handler;
        switch (device.category) {
            case 'kj':
                handler = new AirPurifierAccessory_1.default(platform, accessory);
                break;
            case 'dj':
            case 'dsd':
            case 'xdd':
            case 'fwd':
            case 'dc':
            case 'dd':
            case 'gyd':
            case 'tyndj':
            case 'sxd':
                handler = new LightAccessory_1.default(platform, accessory);
                break;
            case 'tgq':
            case 'tgkg':
                handler = new DimmerAccessory_1.default(platform, accessory);
                break;
            case 'cz':
            case 'pc':
            case 'wkcz':
                handler = new OutletAccessory_1.default(platform, accessory);
                break;
            case 'kg':
            case 'tdq':
            case 'qjdcz':
                handler = new SwitchAccessory_1.default(platform, accessory);
                break;
            case 'wxkg':
                handler = new WirelessSwitchAccessory_1.default(platform, accessory);
                break;
            case 'cjkg':
                handler = new SceneSwitchAccessory_1.default(platform, accessory);
                break;
            case 'fs':
            case 'fsd':
            case 'fskg':
                handler = new FanAccessory_1.default(platform, accessory);
                break;
            case 'ckmkzq':
                handler = new GarageDoorAccessory_1.default(platform, accessory);
                break;
            case 'mc':
                handler = new WindowAccessory_1.default(platform, accessory);
                break;
            case 'cl':
            case 'clkg':
                handler = new WindowCoveringAccessory_1.default(platform, accessory);
                break;
            case 'wk':
            case 'wkf':
                handler = new ThermostatAccessory_1.default(platform, accessory);
                break;
            case 'qn':
                handler = new HeaterAccessory_1.default(platform, accessory);
                break;
            case 'ggq':
                handler = new ValveAccessory_1.default(platform, accessory);
                break;
            case 'ywbj':
                handler = new SmokeSensorAccessory_1.default(platform, accessory);
                break;
            case 'mcs':
                handler = new ContactSensorAccessory_1.default(platform, accessory);
                break;
            case 'rqbj':
            case 'jwbj':
            case 'sj':
                handler = new LeakSensorAccessory_1.default(platform, accessory);
                break;
            case 'cobj':
            case 'cocgq':
                handler = new CarbonMonoxideSensorAccessory_1.default(platform, accessory);
                break;
            case 'co2bj':
            case 'co2cgq':
                handler = new CarbonDioxideSensorAccessory_1.default(platform, accessory);
                break;
            case 'wnykq':
                handler = new TemperatureHumidityIRSensorAccessory_1.default(platform, accessory);
                break;
            case 'wsdcg':
                handler = new TemperatureHumiditySensorAccessory_1.default(platform, accessory);
                break;
            case 'ldcg':
                handler = new LightSensorAccessory_1.default(platform, accessory);
                break;
            case 'pir':
                handler = new MotionSensorAccessory_1.default(platform, accessory);
                break;
            case 'pm25':
            case 'pm2.5':
            case 'pm25cgq':
            case 'hjjcy':
                handler = new AirQualitySensorAccessory_1.default(platform, accessory);
                break;
            case 'hps':
                handler = new HumanPresenceSensorAccessory_1.default(platform, accessory);
                break;
            case 'jsq':
                handler = new HumidifierAccessory_1.default(platform, accessory);
                break;
            case 'cs':
                handler = new DehumidifierAccessory_1.default(platform, accessory);
                break;
            case 'xxj':
                handler = new DiffuserAccessory_1.default(platform, accessory);
                break;
            case 'kt':
            case 'ktkzq':
                handler = new AirConditionerAccessory_1.default(platform, accessory);
                break;
            case 'sp':
                handler = new CameraAccessory_1.default(platform, accessory);
                break;
            case 'scene':
                handler = new SceneAccessory_1.default(platform, accessory);
                break;
        }
        if (handler && !handler.checkRequirements()) {
            handler = undefined;
        }
        if (!handler) {
            platform.log.warn(`Unsupported device: ${device.name}.`);
            handler = new BaseAccessory_1.default(platform, accessory);
        }
        handler.configureServices();
        handler.configureStatusActive();
        handler.updateAllValues();
        handler.intialized = true;
        return handler;
    }
}
exports.default = AccessoryFactory;
//# sourceMappingURL=AccessoryFactory.js.map