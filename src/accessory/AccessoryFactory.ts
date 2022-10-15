import { PlatformAccessory } from 'homebridge';
import TuyaDevice from '../device/TuyaDevice';
import { TuyaPlatform } from '../platform';
import { BaseAccessory } from './BaseAccessory';
import SwitchAccessory from './SwitchAccessory';

export default class AccessoryFactory {
  static createAccessory(
    platform: TuyaPlatform,
    accessory: PlatformAccessory,
    device: TuyaDevice,
  ) {

    let handler;
    switch (device.category) {
      case 'kj':
        // TODO AirPurifierAccessory
        break;
      case 'dj':
      case 'dd':
      case 'fwd':
      case 'tgq':
      case 'xdd':
      case 'dc':
      case 'tgkg':
        // TODO LightAccessory
        break;
      case 'cz':
      case 'pc':
        // TODO OutletAccessory
        break;
      case 'kg':
      case 'tdq':
        handler = new SwitchAccessory(platform, accessory);
        break;
      case 'fs':
      case 'fskg':
        // TODO Fanv2Accessory
        break;
      case 'ywbj':
        // TODO SmokeSensorAccessory
        break;
      case 'qn':
        // TODO HeaterAccessory
        break;
      case 'ckmkzq':
        // TODO GarageDoorAccessory
        break;
      case 'cl':
        // TODO WindowCoveringAccessory
        break;
      case 'mcs':
        // TODO ContactSensorAccessory
        break;
      case 'rqbj':
      case 'jwbj':
        // TODO LeakSensorAccessory
        break;
    }

    if (!handler) {
      platform.log.warn(`Unsupported device: ${device.name}. Using BaseAccessory instead.`);
      handler = new BaseAccessory(platform, accessory);
    }

    return handler as BaseAccessory;
  }
}
