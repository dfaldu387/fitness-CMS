import type { PayloadHandler } from 'payload'
import { getNotificationsSetting, updateNotificationsSettings } from './notificationsSetting';

export const customNotificationEndpoints: { path: string; method: any; handler: PayloadHandler }[] = [
    { path: '/get-notifications-setting', method: 'get', handler: getNotificationsSetting },
    { path: '/update-notifications-settings', method: 'patch', handler: updateNotificationsSettings },
]
