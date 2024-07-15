/**
 * Class to represent and control one Daikin Cloud Device
 */
export declare class DaikinCloudDevice {
    client: any;
    desc: any;
    managementPoints: Record<string, any>;
    private latestUpdateData;
    /**
     * Constructor, called from DaikinCloud class when initializing all devices
     *
     * @param deviceDescription object with device description from Cloud request
     * @param cloudInstance Instance of DaikinCloud used for communication
     */
    constructor(deviceDescription: any, client: any);
    /**
     * Helper method to traverse the Device object returned by Daikin cloud for subPath datapoints
     *
     * @param {object} obj Object to traverse
     * @param {object} data Data object where all data are collected
     * @param {string} [pathPrefix] remember the path when traversing through structure
     * @returns {object} collected data
     * @private
     */
    _traverseDatapointStructure(obj: any, data?: any, pathPrefix?: string): any;
    /**
     * Set a device description and parse/traverse data structure
     *
     * @param desc Device Description
     */
    setDescription(desc: any): void;
    /**
     * Get Daikin Device UUID
     * @returns {string} Device Id (UUID)
     */
    getId(): any;
    /**
     * Get the original Daikin Device Description
     *
     * @returns {object} Daikin Device Description
     */
    getDescription(): any;
    /**
     * Get the timestamp when data were last updated
     *
     * @returns {Date} Last updated timestamp
     */
    getLastUpdated(): Date;
    /**
     * Get the info if device is connected to cloud
     *
     * @returns {boolean} Connected status
     */
    isCloudConnectionUp(): boolean;
    /**
     * Get a current data object (includes value and meta information).
     * Without any parameter the full internal data structure is returned and
     * can be further detailed by sending parameters
     *
     * @param {string} [managementPoint] Management point name
     * @param {string} [dataPoint] Datapoint name for management point
     * @param {string} [dataPointPath] further detailed datapoints with subpath data
     * @returns {object|null} Data object
     */
    getData(managementPoint: any, dataPoint: any, dataPointPath: any): any;
    /**
     * Update the data of this device from the cloud
     *
     * @returns {Promise<boolean>}
     */
    updateData(forceUpdate: Boolean): Promise<boolean>;
    /**
     * Validates a value that should be sent to the Daikin Device
     *
     * @param {object} def  Datapoint definition/meta data to verify
     * @param {any} value Value to be set
     * @throws Error
     * @private
     */
    _validateData(def: any, value: any): void;
    /**
     * Set a datapoint on this device
     *
     * @param {string} managementPoint Management point name
     * @param {string} dataPoint Datapoint name for management point
     * @param {string} [dataPointPath] further detailed datapoints with subpath data, if needed
     * @param {number|string} value Value to set
     * @returns {Promise<Object|boolean>} should return a true - or if a body is returned teh body object (can this happen?)
     */
    setData(managementPoint: any, dataPoint: any, dataPointPath: any, value: any): Promise<any>;
}
//# sourceMappingURL=device.d.ts.map