// src/collections/profile.ts
import type { CollectionConfig } from 'payload'
import { upsertProfile } from '../api/profiles/upsert'
import { getMyProfile } from '../api/profiles/me'

const Profile: CollectionConfig = {
  slug: 'profiles',
  admin: { useAsTitle: 'preferredName' },
  access: {
    create: ({ req }) => Boolean(req.user),
    read:   ({ req }) => (req.user?.role === 'admin' ? true : { user: { equals: req.user?.id } }),
    update: ({ req }) => (req.user?.role === 'admin' ? true : { user: { equals: req.user?.id } }),
    delete: ({ req }) => (req.user?.role === 'admin' ? true : { user: { equals: req.user?.id } }),
  },
  fields: [
    { name: 'user', type: 'relationship', relationTo: 'users', required: true, unique: true },
    { name: 'preferredName', type: 'text' },
    { name: 'gender', type: 'select', options: ['male','female','other','na'] },
    { name: 'birthdate', type: 'date' },
  ],
  hooks: {
    beforeChange: [
      async ({ req, data, operation }) => {
        if (operation === 'create' && !data.user && req.user) data.user = req.user.id
        return data
      },
    ],
  },
  endpoints: [
    { path: '/upsert', method: 'post', handler: upsertProfile },
    { path: '/me',     method: 'get',  handler: getMyProfile },
  ],
}

export default Profile
