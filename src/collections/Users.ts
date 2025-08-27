import type { CollectionConfig } from 'payload'
import { customUserEndpoints } from '@/api/users'
import { v4 as uuidv4 } from 'uuid'

const Users: CollectionConfig = {
  slug: 'users',
  auth: { verify: true, maxLoginAttempts: 5 },

  admin: {
    defaultColumns: ['id', 'userId', 'birthdate', 'email', 'name', 'role', 'updatedAt', '_verified'],
    useAsTitle: 'email',
  },

  access: {
    create: () => true,
    read: ({ req }) => (req.user?.role === 'admin' ? true : { id: { equals: req.user?.id } }),
    update: ({ req }) => (req.user?.role === 'admin' ? true : { id: { equals: req.user?.id } }),
    delete: ({ req }) => req.user?.role === 'admin',
  },

  fields: [
    { name: 'userId', type: 'text', unique: true, required: false, defaultValue: () => uuidv4(), admin: { readOnly: true }, },
    { name: 'name', type: 'text', required: true },
    { name: 'role', type: 'select', options: ['admin', 'editor', 'viewer'], required: true, defaultValue: 'viewer' },
    { name: 'email', type: 'email', required: true, unique: true, },
    { name: 'birthdate', type: 'date' },
    { name: 'acceptedTerms', type: 'checkbox' },

    // OTP-related hidden fields
    { name: 'emailOtpHash', type: 'text', admin: { hidden: true } },
    { name: 'emailOtpExpiresAt', type: 'date', admin: { hidden: true } },
    { name: 'emailOtpAttempts', type: 'number', defaultValue: 0, admin: { hidden: true } },
    { name: 'emailOtpLastSentAt', type: 'date', admin: { hidden: true } },
  ],

  endpoints: customUserEndpoints,
}

export default Users
