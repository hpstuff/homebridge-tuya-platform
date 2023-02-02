"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureTempDisplayUnits = void 0;
function configureTempDisplayUnits(accessory, service, schema) {
    if (!schema) {
        return;
    }
    const { CELSIUS, FAHRENHEIT } = accessory.Characteristic.TemperatureDisplayUnits;
    service.getCharacteristic(accessory.Characteristic.TemperatureDisplayUnits)
        .onGet(() => {
        const status = accessory.getStatus(schema.code);
        return (status.value.toLowerCase() === 'c') ? CELSIUS : FAHRENHEIT;
    })
        .onSet(value => {
        const status = accessory.getStatus(schema.code);
        const isLowerCase = status.value.toLowerCase() === status.value;
        let unit = (value === CELSIUS) ? 'c' : 'f';
        unit = isLowerCase ? unit.toLowerCase() : unit.toUpperCase();
        accessory.sendCommands([{
                code: schema.code,
                value: unit,
            }]);
    });
}
exports.configureTempDisplayUnits = configureTempDisplayUnits;
//# sourceMappingURL=TemperatureDisplayUnits.js.map