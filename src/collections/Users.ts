// src/collections/Users.ts
import type { CollectionConfig } from 'payload'
import { sendOtp } from '../api/users/send-otp'
import { resendOtp } from '../api/users/resend-otp'
import { verifyOtp } from '../api/users/verify-otp'

const Users: CollectionConfig = {
  slug: 'users',
  auth: { verify: true, maxLoginAttempts: 5 },

  admin: {
    defaultColumns: ['id', 'email', 'name', 'role', 'updatedAt', '_verified'],
    useAsTitle: 'email',
  },

  access: {
    create: () => true,
    read: ({ req }) => (req.user?.role === 'admin' ? true : { id: { equals: req.user?.id } }),
    update: ({ req }) => (req.user?.role === 'admin' ? true : { id: { equals: req.user?.id } }),
    delete: ({ req }) => req.user?.role === 'admin',
  },

  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'role', type: 'select', options: ['admin', 'editor', 'viewer'], required: true, defaultValue: 'viewer' },
    { name: 'emailOtpHash', type: 'text', admin: { hidden: true } },
    { name: 'emailOtpExpiresAt', type: 'date', admin: { hidden: true } },
    { name: 'emailOtpAttempts', type: 'number', defaultValue: 0, admin: { hidden: true } },
    { name: 'emailOtpLastSentAt', type: 'date', admin: { hidden: true } },
  ],

  endpoints: [
    { path: '/send-otp', method: 'post', handler: sendOtp },
    { path: '/resend-otp', method: 'post', handler: resendOtp },
    { path: '/verify-otp', method: 'post', handler: verifyOtp },
  ],
}

export default Users
