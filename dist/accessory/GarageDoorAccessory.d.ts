import BaseAccessory from './BaseAccessory';
export default class GarageDoorAccessory extends BaseAccessory {
    requiredSchema(): string[][];
    configureServices(): void;
    mainService(): import("hap-nodejs").Service;
    configureCurrentDoorState(): void;
    configureTargetDoorState(): void;
}
//# sourceMappingURL=GarageDoorAccessory.d.ts.map