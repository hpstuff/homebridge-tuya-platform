export declare enum TuyaDeviceSchemaMode {
    UNKNOWN = "",
    READ_WRITE = "rw",
    READ_ONLY = "ro",
    WRITE_ONLY = "wo"
}
export declare enum TuyaDeviceSchemaType {
    Boolean = "Boolean",
    Integer = "Integer",
    Enum = "Enum",
    String = "String",
    Json = "Json",
    Raw = "Raw"
}
export type TuyaDeviceSchemaIntegerProperty = {
    min: number;
    max: number;
    scale: number;
    step: number;
    unit: string;
};
export type TuyaDeviceSchemaEnumProperty = {
    range: string[];
};
export type TuyaDeviceSchemaStringProperty = string;
export type TuyaDeviceSchemaJSONProperty = object;
export type TuyaDeviceSchemaProperty = TuyaDeviceSchemaIntegerProperty | TuyaDeviceSchemaEnumProperty | TuyaDeviceSchemaStringProperty | TuyaDeviceSchemaJSONProperty;
export type TuyaDeviceSchema = {
    code: string;
    mode: TuyaDeviceSchemaMode;
    type: TuyaDeviceSchemaType;
    property: TuyaDeviceSchemaProperty;
};
export type TuyaDeviceStatus = {
    code: string;
    value: string | number | boolean;
};
export default class TuyaDevice {
    id: string;
    uuid: string;
    name: string;
    online: boolean;
    owner_id: string;
    product_id: string;
    product_name: string;
    icon: string;
    category: string;
    schema: TuyaDeviceSchema[];
    status: TuyaDeviceStatus[];
    ip: string;
    lat: string;
    lon: string;
    time_zone: string;
    create_time: number;
    active_time: number;
    update_time: number;
    constructor(obj: Partial<TuyaDevice>);
    isVirtualDevice(): boolean;
}
//# sourceMappingURL=TuyaDevice.d.ts.map