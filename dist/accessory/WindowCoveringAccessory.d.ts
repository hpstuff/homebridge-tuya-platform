import BaseAccessory from './BaseAccessory';
export default class WindowCoveringAccessory extends BaseAccessory {
    requiredSchema(): string[][];
    configureServices(): void;
    mainService(): import("hap-nodejs").Service;
    configureCurrentPosition(): void;
    configurePositionState(): void;
    configureTargetPositionPercent(): void;
    configureTargetPositionControl(): void;
}
//# sourceMappingURL=WindowCoveringAccessory.d.ts.map