import BaseAccessory from './BaseAccessory';
export default class AirQualitySensorAccessory extends BaseAccessory {
    requiredSchema(): string[][];
    configureServices(): void;
    mainService(): import("hap-nodejs").Service;
    configureAirQuality(): void;
    configurePM2_5Density(): void;
    configurePM10Density(): void;
    configureVOCDensity(): void;
}
//# sourceMappingURL=AirQualitySensorAccessory.d.ts.map