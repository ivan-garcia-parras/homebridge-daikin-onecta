import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';
import { DaikinCloudController } from './onecta/index';
import { DaikinCloudDevice } from './onecta/device';
export declare class DaikinCloudPlatform implements DynamicPlatformPlugin {
    readonly log: Logger;
    readonly config: PlatformConfig;
    readonly api: API;
    readonly Service: typeof Service;
    readonly Characteristic: typeof Characteristic;
    readonly accessories: PlatformAccessory[];
    readonly storagePath: string;
    constructor(log: Logger, config: PlatformConfig, api: API);
    configureAccessory(accessory: PlatformAccessory): void;
    discoverDevices(clientId: string, clientSecret: string, accessToken: string, refreshToken: string, authenticationToken: string): Promise<void>;
    getCloudDevices(clientId: string, clientSecret: string): Promise<DaikinCloudDevice[]>;
    initiateDaikinCloudController(clientId: string, clientSecret: string): Promise<DaikinCloudController>;
    private isExcludedDevice;
}
//# sourceMappingURL=platform.d.ts.map