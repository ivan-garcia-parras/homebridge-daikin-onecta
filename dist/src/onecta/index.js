"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DaikinCloudController = void 0;
const events_1 = require("events");
const device_1 = require("./device");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
/**
 * Daikin Controller for Cloud solution to get tokens and interact with devices
 */
class DaikinCloudController extends events_1.EventEmitter {
    clientId;
    clientSecret;
    tokenFile;
    constructor(clientId, clientSecret, storagePath) {
        super();
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.tokenFile = path_1.default.join(storagePath, 'DaikinOAuthToken.json');
    }
    /**
     * Get Daikin API Info
     * @returns {Promise<Object>} API Info object
     */
    async getApiInfo() {
        return await this.doBearerRequest('/v1/info', null, false);
    }
    /**
     * Get pure Device Data from the Daikin cloud devices
     * @returns {Promise<Object>} pure Device details
     */
    async getCloudDeviceDetails() {
        return await this.doBearerRequest('/v1/gateway-devices', null, false);
    }
    /**
     * Get array of DaikinCloudDevice objects to interact with the device and get data
     */
    async getCloudDevices() {
        const devices = await this.getCloudDeviceDetails();
        return devices.map(device => new device_1.DaikinCloudDevice(device, this));
    }
    async doBearerRequest(resourceUrl, extraOptions, refreshed) {
        if (!resourceUrl.startsWith('http')) {
            resourceUrl = 'https://api.onecta.daikineurope.com' + resourceUrl;
        }
        const options = {
            headers: {
                'Authorization': 'Bearer ' + (await this.getTokenSet()).access_token,
                'Content-Type': 'application/json'
            },
            ...extraOptions
        };
        const fetchResponse = await fetch(resourceUrl, options);
        this.printRateLimitStatus(fetchResponse.headers);
        if (fetchResponse.status === 204) {
            return true;
        }
        if (fetchResponse.status === 200) {
            return await fetchResponse.json();
        }
        if (!refreshed && fetchResponse.status === 401) { // Refresh needed
            await this.refreshAccessToken();
            return await this.doBearerRequest(resourceUrl, extraOptions, true);
        }
        const err = new Error(`Call to ONECTA Cloud API failed with status [${fetchResponse.status}], response: ${JSON.stringify(await fetchResponse.json(), null, 4)}`);
        throw err;
    }
    printRateLimitStatus(headers) {
        console.debug(`Rate Limit: calls left today: ${headers.get('X-RateLimit-Remaining-day')}/${headers.get('X-RateLimit-Limit-day')}`);
        console.debug(`Rate Limit: calls left this minute: ${headers.get('X-RateLimit-Remaining-minute')}/${headers.get('X-RateLimit-Limit-minute')}, resets in ${headers.get('RateLimit-Reset')} seconds`);
    }
    async refreshAccessToken() {
        try {
            const queryParameters = new URLSearchParams();
            queryParameters.set('grant_type', 'refresh_token');
            queryParameters.set('client_id', this.clientId);
            queryParameters.set('client_secret', this.clientSecret);
            queryParameters.set('refresh_token', (await this.getTokenSet()).refresh_token);
            const response = await fetch(`https://idp.onecta.daikineurope.com/v1/oidc/token?${queryParameters.toString()}`, {
                method: 'POST',
            });
            if (response.status !== 200) {
                throw new Error(`Token call failed with status ${response.status}, reason: ${JSON.stringify(await response.json(), null, 4)}`);
            }
            const newTokenSet = await response.json();
            fs_1.default.writeFileSync(this.tokenFile, JSON.stringify(newTokenSet));
            this.emit('token_update', newTokenSet);
            return newTokenSet;
        }
        catch (e) {
            throw new Error('Token refresh failed: ' + e);
        }
    }
    async getTokenSet() {
        return JSON.parse(fs_1.default.readFileSync(this.tokenFile).toString());
    }
}
exports.DaikinCloudController = DaikinCloudController;
//# sourceMappingURL=index.js.map