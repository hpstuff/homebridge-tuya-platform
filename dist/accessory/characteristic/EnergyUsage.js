"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureEnergyUsage = void 0;
function configureEnergyUsage(api, accessory, service, currentSchema, powerSchema, voltageSchema) {
    if (currentSchema) {
        if (isUnit(currentSchema, 'A', 'mA')) {
            const amperes = createAmperesCharacteristic(api);
            if (!service.testCharacteristic(amperes)) {
                service.addCharacteristic(amperes).onGet(createStatusGetter(accessory, currentSchema, isUnit(currentSchema, 'mA') ? 1000 : 0));
            }
        }
        else {
            accessory.log.warn('Unsupported current unit %p', currentSchema);
        }
    }
    if (powerSchema) {
        if (isUnit(powerSchema, 'W')) {
            const watts = createWattsCharacteristic(api);
            if (!service.testCharacteristic(watts)) {
                service.addCharacteristic(watts).onGet(createStatusGetter(accessory, powerSchema));
            }
        }
        else {
            accessory.log.warn('Unsupported power unit %p', currentSchema);
        }
    }
    if (voltageSchema) {
        if (isUnit(voltageSchema, 'V')) {
            const volts = createVoltsCharacteristic(api);
            if (!service.testCharacteristic(volts)) {
                service.addCharacteristic(volts).onGet(createStatusGetter(accessory, voltageSchema));
            }
        }
        else {
            accessory.log.warn('Unsupported voltage unit %p', currentSchema);
        }
    }
}
exports.configureEnergyUsage = configureEnergyUsage;
function isUnit(schema, ...units) {
    return units.includes(schema.property.unit);
}
function createStatusGetter(accessory, schema, divisor = 1) {
    const property = schema.property;
    divisor *= Math.pow(10, property.scale);
    return () => {
        const status = accessory.getStatus(schema.code);
        return status.value / divisor;
    };
}
function createAmperesCharacteristic(api) {
    var _a;
    return _a = class Amperes extends api.hap.Characteristic {
            constructor() {
                super('Amperes', Amperes.UUID, {
                    format: "float" /* api.hap.Formats.FLOAT */,
                    perms: ["ev" /* api.hap.Perms.NOTIFY */, "pr" /* api.hap.Perms.PAIRED_READ */],
                    unit: 'A',
                });
            }
        },
        _a.UUID = 'E863F126-079E-48FF-8F27-9C2605A29F52',
        _a;
}
function createWattsCharacteristic(api) {
    var _a;
    return _a = class Watts extends api.hap.Characteristic {
            constructor() {
                super('Consumption', Watts.UUID, {
                    format: "float" /* api.hap.Formats.FLOAT */,
                    perms: ["ev" /* api.hap.Perms.NOTIFY */, "pr" /* api.hap.Perms.PAIRED_READ */],
                    unit: 'W',
                });
            }
        },
        _a.UUID = 'E863F10D-079E-48FF-8F27-9C2605A29F52',
        _a;
}
function createVoltsCharacteristic(api) {
    var _a;
    return _a = class Volts extends api.hap.Characteristic {
            constructor() {
                super('Volts', Volts.UUID, {
                    format: "float" /* api.hap.Formats.FLOAT */,
                    perms: ["ev" /* api.hap.Perms.NOTIFY */, "pr" /* api.hap.Perms.PAIRED_READ */],
                    unit: 'V',
                });
            }
        },
        _a.UUID = 'E863F10A-079E-48FF-8F27-9C2605A29F52',
        _a;
}
//# sourceMappingURL=EnergyUsage.js.map