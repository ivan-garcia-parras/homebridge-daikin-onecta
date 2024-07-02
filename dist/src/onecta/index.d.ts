/// <reference types="node" />
import { EventEmitter } from 'events';
import { DaikinCloudDevice } from './device';
/**
 * Daikin Controller for Cloud solution to get tokens and interact with devices
 */
export declare class DaikinCloudController extends EventEmitter {
    private clientId;
    private clientSecret;
    private tokenFile;
    constructor(clientId: string, clientSecret: string, storagePath: string);
    /**
     * Get Daikin API Info
     * @returns {Promise<Object>} API Info object
     */
    getApiInfo(): Promise<any>;
    /**
     * Get pure Device Data from the Daikin cloud devices
     * @returns {Promise<Object>} pure Device details
     */
    getCloudDeviceDetails(): Promise<any[]>;
    /**
     * Get array of DaikinCloudDevice objects to interact with the device and get data
     */
    getCloudDevices(): Promise<DaikinCloudDevice[]>;
    doBearerRequest(resourceUrl: any, extraOptions: any, refreshed: any): any;
    printRateLimitStatus(headers: any): void;
    refreshAccessToken(): Promise<unknown>;
    getTokenSet(): Promise<any>;
}
//# sourceMappingURL=index.d.ts.map