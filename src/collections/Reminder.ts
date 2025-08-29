import { customReminderEndpoints } from '@/api/reminders'
import type { CollectionConfig } from 'payload'

const Reminders: CollectionConfig = {
    slug: 'reminders',
    admin: {
        defaultColumns: ['id', 'haiReminders', 'coachingReminders', 's11Reminders', 'drinkWater', 'standMove', 'sleep'],
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
            name: 'haiReminders',
            type: 'checkbox',
            defaultValue: false,
        },
        {
            name: 'coachingReminders',
            type: 'checkbox',
            defaultValue: false,
        },
        {
            name: 's11Reminders',
            type: 'checkbox',
            defaultValue: false,
        },
        {
            name: 'drinkWater',
            type: 'checkbox',
            defaultValue: false,
        },
        {
            name: 'standMove',
            type: 'checkbox',
            defaultValue: false,
        },
        {
            name: 'sleep',
            type: 'checkbox',
            defaultValue: false,
        },
    ],

    endpoints: customReminderEndpoints,
}

export default Reminders
