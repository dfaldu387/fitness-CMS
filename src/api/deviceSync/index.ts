import type { PayloadHandler } from 'payload'
import { getDeviceSync, updateDeviceSync } from './deviceSync';

export const customDeviceSyncEndpoints: { path: string; method: any; handler: PayloadHandler }[] = [
    { path: '/get-device-sync', method: 'get', handler: getDeviceSync },
    { path: '/update-device-sync', method: 'patch', handler: updateDeviceSync },
]
