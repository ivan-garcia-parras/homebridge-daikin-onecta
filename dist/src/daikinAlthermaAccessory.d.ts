import { PlatformAccessory, CharacteristicValue } from 'homebridge';
import { DaikinCloudPlatform } from './platform';
import { daikinAccessory } from './daikinAccessory';
export declare class daikinAlthermaAccessory extends daikinAccessory {
    private readonly name;
    private service;
    private hotWaterTankService;
    constructor(platform: DaikinCloudPlatform, accessory: PlatformAccessory);
    handleActiveStateGet(): Promise<CharacteristicValue>;
    handleActiveStateSet(value: CharacteristicValue): Promise<void>;
    handleCurrentTemperatureGet(): Promise<CharacteristicValue>;
    handleHotWaterTankCurrentTemperatureGet(): Promise<CharacteristicValue>;
    handleTargetHeaterCoolerStateGet(): Promise<CharacteristicValue>;
    handleTargetHeaterCoolerStateSet(value: CharacteristicValue): Promise<void>;
    handleCoolingThresholdTemperatureGet(): Promise<CharacteristicValue>;
    handleCoolingThresholdTemperatureSet(value: CharacteristicValue): Promise<void>;
    handleHeatingThresholdTemperatureGet(): Promise<CharacteristicValue>;
    handleHeatingThresholdTemperatureSet(value: CharacteristicValue): Promise<void>;
    handleHotWaterTankHeatingTargetTemperatureGet(): Promise<CharacteristicValue>;
    handleHotWaterTankHeatingTargetTemperatureSet(value: CharacteristicValue): Promise<void>;
    handleHotWaterTankTargetHeaterCoolerStateGet(): Promise<CharacteristicValue>;
    handleHotWaterTankTargetHeaterCoolerStateSet(value: CharacteristicValue): Promise<void>;
    hasOnlyHeating(): boolean;
}
//# sourceMappingURL=daikinAlthermaAccessory.d.ts.map