import { PlatformAccessory } from 'homebridge';
import { DaikinCloudPlatform } from './platform';
export declare class daikinAccessory {
    readonly platform: DaikinCloudPlatform;
    readonly accessory: PlatformAccessory;
    constructor(platform: DaikinCloudPlatform, accessory: PlatformAccessory);
    printDeviceInfo(): void;
}
//# sourceMappingURL=daikinAccessory.d.ts.map