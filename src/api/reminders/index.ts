import type { PayloadHandler } from 'payload'
import { getReminders, updateReminders } from './reminders';

export const customReminderEndpoints: { path: string; method: any; handler: PayloadHandler }[] = [
    { path: '/get-reminders', method: 'get', handler: getReminders },
    { path: '/update-reminders', method: 'patch', handler: updateReminders },
]
