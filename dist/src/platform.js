"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DaikinCloudPlatform = void 0;
const settings_1 = require("./settings");
const daikinAirConditioningAccessory_1 = require("./daikinAirConditioningAccessory");
const index_1 = require("./onecta/index");
const daikinAlthermaAccessory_1 = require("./daikinAlthermaAccessory");
class DaikinCloudPlatform {
    log;
    config;
    api;
    Service;
    Characteristic;
    accessories = [];
    storagePath = '';
    constructor(log, config, api) {
        this.log = log;
        this.config = config;
        this.api = api;
        this.Service = this.api.hap.Service;
        this.Characteristic = this.api.hap.Characteristic;
        this.log.debug('Finished initializing platform:', this.config.name);
        this.storagePath = api.user.storagePath();
        this.api.on('didFinishLaunching', async () => {
            log.debug('Executed didFinishLaunching callback');
            await this.discoverDevices(this.config.clientId, this.config.clientSecret, this.config.accessToken, this.config.refreshToken, this.config.authenticationToken);
        });
    }
    configureAccessory(accessory) {
        this.log.info('Loading accessory from cache:', accessory.displayName);
        this.accessories.push(accessory);
    }
    async discoverDevices(clientId, clientSecret, accessToken, refreshToken, authenticationToken) {
        let devices = [];
        this.log.info('--- Daikin info for debugging reasons (enable Debug Mode for more logs) ---');
        try {
            devices = await this.getCloudDevices(clientId, clientSecret);
        }
        catch (error) {
            if (error instanceof Error) {
                error.message = `Failed to get cloud devices from Daikin Cloud: ${error.message}`;
                this.log.error(error.message);
            }
        }
        devices.forEach(device => {
            try {
                const uuid = this.api.hap.uuid.generate(device.getId());
                const climateControlEmbeddedId = device.getDescription().deviceModel === 'Altherma' ? 'climateControlMainZone' : 'climateControl';
                const name = device.getData(climateControlEmbeddedId, 'name', null).value;
                const deviceModel = device.getDescription().deviceModel;
                const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);
                if (this.isExcludedDevice(this.config.excludedDevicesByDeviceId, uuid)) {
                    this.log.info(`Device with id ${uuid} is excluded, don't add accessory`);
                    if (existingAccessory) {
                        this.api.unregisterPlatformAccessories(settings_1.PLUGIN_NAME, settings_1.PLATFORM_NAME, [existingAccessory]);
                    }
                    return;
                }
                if (existingAccessory) {
                    this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);
                    existingAccessory.context.device = device;
                    this.api.updatePlatformAccessories([existingAccessory]);
                    if (deviceModel === 'Altherma') {
                        new daikinAlthermaAccessory_1.daikinAlthermaAccessory(this, existingAccessory);
                    }
                    else {
                        new daikinAirConditioningAccessory_1.daikinAirConditioningAccessory(this, existingAccessory);
                    }
                }
                else {
                    this.log.info('Adding new accessory:', name);
                    const accessory = new this.api.platformAccessory(name, uuid);
                    accessory.context.device = device;
                    if (deviceModel === 'Altherma') {
                        new daikinAlthermaAccessory_1.daikinAlthermaAccessory(this, accessory);
                    }
                    else {
                        new daikinAirConditioningAccessory_1.daikinAirConditioningAccessory(this, accessory);
                    }
                    this.api.registerPlatformAccessories(settings_1.PLUGIN_NAME, settings_1.PLATFORM_NAME, [accessory]);
                }
            }
            catch (error) {
                // eslint-disable-next-line no-console
                console.error(error);
                if (error instanceof Error) {
                    this.log.error(`Failed to create HeaterCooler accessory from device, only HeaterCooler is supported at the moment: ${error.message}, device JSON: ${JSON.stringify(device)}`);
                }
            }
        });
        this.log.info('--------------- End Daikin info for debugging reasons --------------------');
    }
    async getCloudDevices(clientId, clientSecret) {
        const daikinCloud = await this.initiateDaikinCloudController(clientId, clientSecret);
        const devices = await daikinCloud.getCloudDevices();
        this.log.info(`Found ${devices.length} devices in your Daikin Cloud`);
        if (devices.length === 0) {
            return devices;
        }
        return devices;
    }
    async initiateDaikinCloudController(clientId, clientSecret) {
        const daikinCloudController = new index_1.DaikinCloudController(clientId, clientSecret, this.api.user.storagePath());
        daikinCloudController.on('token_update', _ => {
            this.log.info('Retrieved new credentials from Daikin Cloud');
        });
        return daikinCloudController;
    }
    isExcludedDevice(excludedDevicesByDeviceId, deviceId) {
        return typeof excludedDevicesByDeviceId !== 'undefined' && excludedDevicesByDeviceId.includes(deviceId);
    }
}
exports.DaikinCloudPlatform = DaikinCloudPlatform;
//# sourceMappingURL=platform.js.map