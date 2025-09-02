import { customNewsDashboardEndpoints } from '@/api/newsDashboard';
import type { CollectionConfig } from 'payload';

const NewsDashboard: CollectionConfig = {
    slug: 'newsDashboard',
    admin: {
        useAsTitle: 'type',
        defaultColumns: ['id', 'user', 'type', 'date', 'isFavourite', 'content', 'details'],
    },
    access: {
        create: ({ req }) => Boolean(req.user),
        read: ({ req }) => Boolean(req.user),
        update: ({ req }) => Boolean(req.user),
        delete: ({ req }) => Boolean(req.user),
    },
    fields: [
        {
            name: 'user',
            type: 'relationship',
            relationTo: 'users',
            required: true,
            label: 'User',
        },
        {
            name: 'type',
            type: 'select',
            options: [
                { label: 'Updates', value: 'updates' },
                { label: 'News', value: 'news' },
                { label: 'Wellness', value: 'wellness' },
            ],
            required: true,
            label: 'Type',
        },
        {
            name: 'content',
            type: 'textarea',
            required: true,
            label: 'Content',
        },
        {
            name: 'details',
            type: 'textarea',
            required: false,
            label: 'Details',
        },
        {
            name: 'date',
            type: 'date',
            required: true,
            label: 'Date',
            admin: { date: { pickerAppearance: 'dayOnly' } },
        },
        {
            name: 'isFavourite',
            type: 'checkbox',
            label: 'Favourite',
        },
    ],
    hooks: {
        beforeChange: [
            async ({ data, req, operation }) => {
                // Assign the logged-in user if user field is empty
                if (!data.user && req.user) {
                    data.user = req.user.id;
                }

                // ✅ Auto-fill date when creating a new entry
                if (operation === 'create' && !data.date) {
                    data.date = new Date().toISOString(); // current date and time
                }

                return data;
            },
        ],
    },
    endpoints: customNewsDashboardEndpoints,
};

export default NewsDashboard;
