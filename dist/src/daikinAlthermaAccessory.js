"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.daikinAlthermaAccessory = void 0;
const daikinAccessory_1 = require("./daikinAccessory");
class daikinAlthermaAccessory extends daikinAccessory_1.daikinAccessory {
    name;
    service;
    hotWaterTankService;
    constructor(platform, accessory) {
        super(platform, accessory);
        this.name = this.accessory.displayName;
        this.service = this.accessory.getService(this.platform.Service.HeaterCooler) || this.accessory.addService(this.platform.Service.HeaterCooler);
        this.service.setCharacteristic(this.platform.Characteristic.Name, this.name);
        this.service.getCharacteristic(this.platform.Characteristic.Active)
            .onSet(this.handleActiveStateSet.bind(this))
            .onGet(this.handleActiveStateGet.bind(this));
        this.service.getCharacteristic(this.platform.Characteristic.CurrentTemperature)
            .onGet(this.handleCurrentTemperatureGet.bind(this));
        this.service.getCharacteristic(this.platform.Characteristic.TargetHeaterCoolerState)
            .setProps({
            minStep: 1,
            minValue: 0,
            maxValue: 2,
        })
            .onGet(this.handleTargetHeaterCoolerStateGet.bind(this))
            .onSet(this.handleTargetHeaterCoolerStateSet.bind(this));
        if (!this.hasOnlyHeating()) {
            this.service.getCharacteristic(this.platform.Characteristic.CoolingThresholdTemperature)
                .setProps({
                minStep: accessory.context.device.getData('climateControlMainZone', 'temperatureControl', '/operationModes/cooling/setpoints/roomTemperature').minStep,
                minValue: accessory.context.device.getData('climateControlMainZone', 'temperatureControl', '/operationModes/cooling/setpoints/roomTemperature').minValue,
                maxValue: accessory.context.device.getData('climateControlMainZone', 'temperatureControl', '/operationModes/cooling/setpoints/roomTemperature').maxValue,
            })
                .onGet(this.handleCoolingThresholdTemperatureGet.bind(this))
                .onSet(this.handleCoolingThresholdTemperatureSet.bind(this));
        }
        this.service.getCharacteristic(this.platform.Characteristic.HeatingThresholdTemperature)
            .setProps({
            minStep: accessory.context.device.getData('climateControlMainZone', 'temperatureControl', '/operationModes/heating/setpoints/roomTemperature').minStep,
            minValue: accessory.context.device.getData('climateControlMainZone', 'temperatureControl', '/operationModes/heating/setpoints/roomTemperature').minValue,
            maxValue: accessory.context.device.getData('climateControlMainZone', 'temperatureControl', '/operationModes/heating/setpoints/roomTemperature').maxValue,
        })
            .onGet(this.handleHeatingThresholdTemperatureGet.bind(this))
            .onSet(this.handleHeatingThresholdTemperatureSet.bind(this));
        this.hotWaterTankService = this.accessory.getService('Hot water tank') || accessory.addService(this.platform.Service.Thermostat, 'Hot water tank', 'hot_water_tank');
        this.hotWaterTankService.setCharacteristic(this.platform.Characteristic.Name, 'Hot water tank');
        this.hotWaterTankService
            .addOptionalCharacteristic(this.platform.Characteristic.ConfiguredName);
        this.hotWaterTankService
            .setCharacteristic(this.platform.Characteristic.ConfiguredName, 'Hot water tank');
        this.hotWaterTankService.getCharacteristic(this.platform.Characteristic.CurrentTemperature)
            .onGet(this.handleHotWaterTankCurrentTemperatureGet.bind(this));
        this.hotWaterTankService.getCharacteristic(this.platform.Characteristic.TargetTemperature)
            .setProps({
            minStep: accessory.context.device.getData('domesticHotWaterTank', 'temperatureControl', '/operationModes/heating/setpoints/domesticHotWaterTemperature').minStep,
            minValue: accessory.context.device.getData('domesticHotWaterTank', 'temperatureControl', '/operationModes/heating/setpoints/domesticHotWaterTemperature').minValue,
            maxValue: accessory.context.device.getData('domesticHotWaterTank', 'temperatureControl', '/operationModes/heating/setpoints/domesticHotWaterTemperature').maxValue,
        })
            .onGet(this.handleHotWaterTankHeatingTargetTemperatureGet.bind(this))
            .onSet(this.handleHotWaterTankHeatingTargetTemperatureSet.bind(this));
        this.hotWaterTankService.getCharacteristic(this.platform.Characteristic.TargetHeatingCoolingState)
            .setProps({
            minStep: 1,
            minValue: 0,
            maxValue: 1,
        })
            .onGet(this.handleHotWaterTankTargetHeaterCoolerStateGet.bind(this))
            .onSet(this.handleHotWaterTankTargetHeaterCoolerStateSet.bind(this));
    }
    async handleActiveStateGet() {
        await this.accessory.context.device.updateData(false);
        const state = this.accessory.context.device.getData('climateControlMainZone', 'onOffMode').value;
        this.platform.log.debug(`[${this.name}] GET ActiveState, state: ${state}`);
        return state === DaikinOnOffModes.ON;
    }
    async handleActiveStateSet(value) {
        this.platform.log.debug(`[${this.name}] SET ActiveState, state: ${value}`);
        const state = value;
        await this.accessory.context.device.setData('climateControlMainZone', 'onOffMode', state ? DaikinOnOffModes.ON : DaikinOnOffModes.OFF);
        await this.accessory.context.device.updateData(true);
    }
    async handleCurrentTemperatureGet() {
        await this.accessory.context.device.updateData(false);
        const temperature = this.accessory.context.device.getData('climateControlMainZone', 'sensoryData', '/roomTemperature').value;
        this.platform.log.debug(`[${this.name}] GET CurrentTemperature, temperature: ${temperature}`);
        return temperature;
    }
    async handleHotWaterTankCurrentTemperatureGet() {
        await this.accessory.context.device.updateData(false);
        const temperature = this.accessory.context.device.getData('domesticHotWaterTank', 'sensoryData', '/tankTemperature').value;
        this.platform.log.debug(`[${this.name}] GET CurrentTemperature for hot water tank, temperature: ${temperature}`);
        return temperature;
    }
    async handleTargetHeaterCoolerStateGet() {
        await this.accessory.context.device.updateData(false);
        const operationMode = this.accessory.context.device.getData('climateControlMainZone', 'operationMode').value;
        this.platform.log.debug(`[${this.name}] GET TargetHeaterCoolerState, operationMode: ${operationMode}`);
        switch (operationMode) {
            case DaikinOperationModes.COOLING:
                return this.platform.Characteristic.TargetHeaterCoolerState.COOL;
            case DaikinOperationModes.HEATING:
                return this.platform.Characteristic.TargetHeaterCoolerState.HEAT;
            default:
                return this.platform.Characteristic.TargetHeaterCoolerState.AUTO;
        }
    }
    async handleTargetHeaterCoolerStateSet(value) {
        const operationMode = value;
        this.platform.log.debug(`[${this.name}] SET TargetHeaterCoolerState, OperationMode to: ${value}`);
        let daikinOperationMode = DaikinOperationModes.COOLING;
        switch (operationMode) {
            case this.platform.Characteristic.TargetHeaterCoolerState.COOL:
                daikinOperationMode = DaikinOperationModes.COOLING;
                break;
            case this.platform.Characteristic.TargetHeaterCoolerState.HEAT:
                daikinOperationMode = DaikinOperationModes.HEATING;
                break;
            case this.platform.Characteristic.TargetHeaterCoolerState.AUTO:
                daikinOperationMode = DaikinOperationModes.AUTO;
                break;
        }
        this.platform.log.debug(`[${this.name}] SET TargetHeaterCoolerState, daikinOperationMode to: ${daikinOperationMode}`);
        await this.accessory.context.device.setData('climateControlMainZone', 'operationMode', daikinOperationMode);
        await this.accessory.context.device.setData('climateControlMainZone', 'onOffMode', DaikinOnOffModes.ON);
        await this.accessory.context.device.updateData(true);
    }
    async handleCoolingThresholdTemperatureGet() {
        await this.accessory.context.device.updateData(false);
        const temperature = this.accessory.context.device.getData('climateControlMainZone', 'temperatureControl', '/operationModes/cooling/setpoints/roomTemperature').value;
        this.platform.log.debug(`[${this.name}] GET CoolingThresholdTemperature, temperature: ${temperature}`);
        return temperature;
    }
    async handleCoolingThresholdTemperatureSet(value) {
        const temperature = Math.round(value * 2) / 2;
        this.platform.log.debug(`[${this.name}] SET CoolingThresholdTemperature, temperature to: ${temperature}`);
        await this.accessory.context.device.setData('climateControlMainZone', 'temperatureControl', '/operationModes/cooling/setpoints/roomTemperature', temperature);
        await this.accessory.context.device.updateData(true);
    }
    async handleHeatingThresholdTemperatureGet() {
        await this.accessory.context.device.updateData(false);
        const temperature = this.accessory.context.device.getData('climateControlMainZone', 'temperatureControl', '/operationModes/heating/setpoints/roomTemperature').value;
        this.platform.log.debug(`[${this.name}] GET HeatingThresholdTemperature, temperature: ${temperature}`);
        return temperature;
    }
    async handleHeatingThresholdTemperatureSet(value) {
        const temperature = Math.round(value * 2) / 2;
        this.platform.log.debug(`[${this.name}] SET HeatingThresholdTemperature, temperature to: ${temperature}`);
        await this.accessory.context.device.setData('climateControlMainZone', 'temperatureControl', '/operationModes/heating/setpoints/roomTemperature', temperature);
        await this.accessory.context.device.updateData(true);
    }
    async handleHotWaterTankHeatingTargetTemperatureGet() {
        await this.accessory.context.device.updateData(false);
        const temperature = this.accessory.context.device.getData('domesticHotWaterTank', 'temperatureControl', '/operationModes/heating/setpoints/domesticHotWaterTemperature').value;
        this.platform.log.debug(`[${this.name}] GET HeatingThresholdTemperature domesticHotWaterTank, temperature: ${temperature}`);
        return temperature;
    }
    async handleHotWaterTankHeatingTargetTemperatureSet(value) {
        const temperature = Math.round(value * 2) / 2;
        this.platform.log.debug(`[${this.name}] SET HeatingThresholdTemperature domesticHotWaterTank, temperature to: ${temperature}`);
        await this.accessory.context.device.setData('domesticHotWaterTank', 'temperatureControl', '/operationModes/heating/setpoints/domesticHotWaterTemperature', temperature);
        await this.accessory.context.device.updateData(true);
    }
    async handleHotWaterTankTargetHeaterCoolerStateGet() {
        await this.accessory.context.device.updateData(false);
        const operationMode = this.accessory.context.device.getData('domesticHotWaterTank', 'operationMode').value;
        this.platform.log.debug(`[${this.name}] GET TargetHeaterCoolerState, operationMode: ${operationMode}`);
        switch (operationMode) {
            case DaikinOperationModes.COOLING:
                return this.platform.Characteristic.TargetHeatingCoolingState.COOL;
            case DaikinOperationModes.HEATING:
                return this.platform.Characteristic.TargetHeatingCoolingState.HEAT;
            default:
                return this.platform.Characteristic.TargetHeatingCoolingState.AUTO;
        }
    }
    async handleHotWaterTankTargetHeaterCoolerStateSet(value) {
        const operationMode = value;
        this.platform.log.debug(`[${this.name}] SET TargetHeaterCoolerState, OperationMode to: ${value}`);
        let daikinOperationMode = DaikinOperationModes.COOLING;
        if (operationMode === this.platform.Characteristic.TargetHeatingCoolingState.OFF) {
            await this.accessory.context.device.setData('domesticHotWaterTank', 'onOffMode', DaikinOnOffModes.OFF);
            await this.accessory.context.device.updateData(true);
            return;
        }
        switch (operationMode) {
            case this.platform.Characteristic.TargetHeatingCoolingState.COOL:
                daikinOperationMode = DaikinOperationModes.COOLING;
                break;
            case this.platform.Characteristic.TargetHeatingCoolingState.HEAT:
                daikinOperationMode = DaikinOperationModes.HEATING;
                break;
            case this.platform.Characteristic.TargetHeatingCoolingState.AUTO:
                daikinOperationMode = DaikinOperationModes.AUTO;
                break;
        }
        this.platform.log.debug(`[${this.name}] SET TargetHeaterCoolerState, daikinOperationMode to: ${daikinOperationMode}`);
        await this.accessory.context.device.setData('domesticHotWaterTank', 'onOffMode', DaikinOnOffModes.ON);
        await this.accessory.context.device.setData('domesticHotWaterTank', 'operationMode', daikinOperationMode);
        await this.accessory.context.device.updateData(true);
    }
    hasOnlyHeating() {
        const operationModes = this.accessory.context.device.getData('climateControlMainZone', 'operationMode').values;
        this.platform.log.debug(`[${this.name}] hasOnlyHeating, operationModes: ${operationModes.join(', ')}`);
        return operationModes.length === 1 && operationModes[0] === 'heating';
    }
}
exports.daikinAlthermaAccessory = daikinAlthermaAccessory;
var DaikinOnOffModes;
(function (DaikinOnOffModes) {
    DaikinOnOffModes["ON"] = "on";
    DaikinOnOffModes["OFF"] = "off";
})(DaikinOnOffModes || (DaikinOnOffModes = {}));
var DaikinOperationModes;
(function (DaikinOperationModes) {
    DaikinOperationModes["FAN_ONLY"] = "fanOnly";
    DaikinOperationModes["HEATING"] = "heating";
    DaikinOperationModes["COOLING"] = "cooling";
    DaikinOperationModes["AUTO"] = "auto";
    DaikinOperationModes["DRY"] = "dry";
})(DaikinOperationModes || (DaikinOperationModes = {}));
//# sourceMappingURL=daikinAlthermaAccessory.js.map