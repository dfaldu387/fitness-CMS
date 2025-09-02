import { customNotificationEndpoints } from '@/api/notificationsSetting'
import type { CollectionConfig } from 'payload'

const NotificationsSetting: CollectionConfig = {
    slug: 'notificationsSetting',
    admin: {
        defaultColumns: [
            'id',
            'updatesOrNews',
            'haiAlert',
            'exerciseAlerts',
            'loreAlerts',
            'newProductAlerts',
        ],
        useAsTitle: 'user',
    },

    access: {
        create: ({ req }) => Boolean(req.user),
        read: ({ req }) => {
            if (req.user?.role === 'admin') return true
            return { user: { equals: req.user?.id } }
        },
        update: ({ req }) => {
            if (req.user?.role === 'admin') return true
            return { user: { equals: req.user?.id } }
        },
        delete: ({ req }) => req.user?.role === 'admin',
    },

    fields: [
        {
            name: 'user',
            type: 'relationship',
            relationTo: 'users',
            required: true,
            unique: true,
        },
        {
            name: 'updatesOrNews',
            type: 'checkbox',
            defaultValue: false,
        },
        {
            name: 'haiAlert',
            type: 'checkbox',
            defaultValue: false,
        },
        {
            name: 'exerciseAlerts',
            type: 'checkbox',
            defaultValue: false,
        },
        {
            name: 'loreAlerts',
            type: 'checkbox',
            defaultValue: false,
        },
        {
            name: 'newProductAlerts',
            type: 'checkbox',
            defaultValue: false,
        },
    ],

    endpoints: customNotificationEndpoints,
}

export default NotificationsSetting
