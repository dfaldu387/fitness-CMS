import type { CollectionConfig } from 'payload';
import { dataCollection } from '../api/profiles/dataCollectionApi';

const DataCollection: CollectionConfig = {
  slug: 'profiles',
  admin: {
    useAsTitle: 'preferredName',
    defaultColumns: ['user', 'preferredName', 'gender', 'birthdate', 'location', 'extra'],
  },
  access: {
    create: ({ req }) => Boolean(req.user),
    read: ({ req }) => req.user?.role === 'admin' ? true : { user: { equals: req.user?.id } },
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === 'admin' ? true : { user: { equals: req.user?.id } },
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      unique: true,
    },
    { name: 'preferredName', type: 'text' },
    { name: 'gender', type: 'select', options: ['male', 'female'] },
    { name: 'birthdate', type: 'date' },
    { name: 'location', type: 'text', label: 'Country' },
    { name: 'extra', type: 'json', label: 'Additional Fields' },
  ],
  hooks: {
    beforeChange: [
      async ({ req, data, operation }) => {
        if (operation === 'create' && !data.user && req.user) {
          data.user = req.user.id;
        }
        return data;
      },
    ],
  },
  endpoints: [
    { path: '/dataCollection', method: 'post', handler: dataCollection },
  ],
};

export default DataCollection;