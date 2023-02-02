"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureRotationSpeedOn = exports.configureRotationSpeedLevel = exports.configureRotationSpeed = void 0;
const util_1 = require("../../util/util");
function configureRotationSpeed(accessory, service, schema) {
    if (!schema) {
        return;
    }
    const { min, max } = schema.property;
    service.getCharacteristic(accessory.Characteristic.RotationSpeed)
        .onGet(() => {
        const status = accessory.getStatus(schema.code);
        const value = Math.round((0, util_1.remap)(status.value, min, max, 0, 100));
        return (0, util_1.limit)(value, 0, 100);
    })
        .onSet(value => {
        let speed = Math.round((0, util_1.remap)(value, 0, 100, min, max));
        speed = (0, util_1.limit)(speed, min, max);
        accessory.sendCommands([{ code: schema.code, value: speed }], true);
    });
}
exports.configureRotationSpeed = configureRotationSpeed;
function configureRotationSpeedLevel(accessory, service, schema, ignoreValues) {
    if (!schema) {
        return;
    }
    const property = schema.property;
    const range = [];
    for (const value of property.range) {
        if (ignoreValues === null || ignoreValues === void 0 ? void 0 : ignoreValues.includes(value)) {
            continue;
        }
        range.push(value);
    }
    const props = { minValue: 0, maxValue: range.length, minStep: 1, unit: 'speed' };
    accessory.log.debug('Set props for RotationSpeed:', props);
    const onGetHandler = () => {
        const status = accessory.getStatus(schema.code);
        const index = range.indexOf(status.value);
        return (0, util_1.limit)(index + 1, props.minValue, props.maxValue);
    };
    service.getCharacteristic(accessory.Characteristic.RotationSpeed)
        .onGet(onGetHandler)
        .onSet(value => {
        accessory.log.debug('Set RotationSpeed to:', value);
        const index = Math.round(value - 1);
        if (index < 0 || index >= range.length) {
            accessory.log.debug('Out of range, return.');
            return;
        }
        const speedLevel = range[index].toString();
        accessory.log.debug('Set RotationSpeedLevel to:', speedLevel);
        accessory.sendCommands([{ code: schema.code, value: speedLevel }], true);
    })
        .updateValue(onGetHandler()) // ensure the value is correct before set props
        .setProps(props);
}
exports.configureRotationSpeedLevel = configureRotationSpeedLevel;
function configureRotationSpeedOn(accessory, service, schema) {
    if (!schema) {
        return;
    }
    const props = { minValue: 0, maxValue: 100, minStep: 100 };
    accessory.log.debug('Set props for RotationSpeed:', props);
    service.getCharacteristic(accessory.Characteristic.RotationSpeed)
        .onGet(() => {
        const status = accessory.getStatus(schema.code);
        return status.value ? 100 : 0;
    })
        .setProps(props);
}
exports.configureRotationSpeedOn = configureRotationSpeedOn;
//# sourceMappingURL=RotationSpeed.js.map