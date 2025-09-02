import type { CollectionConfig } from 'payload'
import { customUserEndpoints } from '@/api/users'
import { v4 as uuidv4 } from 'uuid'

const Users: CollectionConfig = {
  slug: 'users',
  auth: { verify: true, maxLoginAttempts: 5 },

  admin: {
    defaultColumns: ['id', 'password', 'userId', 'birthdate', 'email', 'name', 'role', 'updatedAt', '_verified'],
    useAsTitle: 'email',
  },

  access: {
    // Only admins can create new users
    create: ({ req }) => req.user?.role === 'admin',
    // All users can read their own data, and admins can read all
    read: ({ req }) => { if (req.user?.role === 'admin') return true; return { id: { equals: req.user?.id, } } },
    // All users can update their own data, and admins can update all
    update: ({ req }) => { if (req.user?.role === 'admin') return true; return { id: { equals: req.user?.id } } },
    // Only admins can delete users
    delete: ({ req }) => req.user?.role === 'admin',
  },

  fields: [
    { name: 'userId', type: 'text', unique: true, required: false, defaultValue: () => uuidv4(), admin: { readOnly: true }, },
    { name: 'name', type: 'text', required: true },
    {
      name: 'role', type: 'select', options: ['admin', 'editor', 'viewer'], required: true, defaultValue: 'editor',
      access: { update: ({ req }) => req.user?.role === 'admin' }
    },
    { name: 'email', type: 'email', required: true, unique: true, },
    { name: 'birthdate', type: 'date' },
    { name: 'acceptedTerms', type: 'checkbox' },

    // OTP-related hidden fields
    { name: 'email_otp_hash', type: 'text', admin: { hidden: true } },
    { name: 'email_otp_expires_at', type: 'date', admin: { hidden: true } },
    { name: 'email_otp_attempts', type: 'number', defaultValue: 0, admin: { hidden: true } },
    { name: 'email_otp_last_sent_at', type: 'date', admin: { hidden: true } },
  ],

  hooks: {
    afterChange: [
      async ({ operation, doc, req }) => {
        if (operation === 'create') {
          try {
            // --- Notifications Settings ---
            const existingNotification = await req.payload.find({
              collection: 'notificationsSetting',
              where: { user: { equals: doc.id } },
              limit: 1,
            })

            if (!existingNotification.docs.length) {
              await req.payload.create({
                collection: 'notificationsSetting',
                data: {
                  user: doc.id,
                  updatesOrNews: false,
                  haiAlert: false,
                  exerciseAlerts: false,
                  loreAlerts: false,
                  newProductAlerts: false,
                },
              })
              req.payload.logger.info(`NotificationsSetting created for user ${doc.id}`)
            }

            // --- Device Syncs ---
            const existingDeviceSync = await req.payload.find({
              collection: 'deviceSync',
              where: { user: { equals: doc.id } },
              limit: 1,
            })

            if (!existingDeviceSync.docs.length) {
              await req.payload.create({
                collection: 'deviceSync',
                data: {
                  user: doc.id,
                  syncIphone: false,
                  syncAppleWatch: false,
                  syncAppleHealthKit: false,
                  syncAndroid: false,
                  syncAndroidFit: false,
                  syncSamsungSmartWatch: false,
                  syncFitbit: false,
                },
              })
              req.payload.logger.info(`DeviceSync created for user ${doc.id}`)
            }
          } catch (err) {
            req.payload.logger.error(`Failed to create related settings for user ${doc.id}: ${err}`)
          }
        }
      },
    ],

    beforeDelete: [
      async ({ id, req }) => {
        req.payload.logger.info(`Attempting to delete related data for user ID: ${id}`);

        try {
          // Delete related notificationsSetting
          const notificationsDeleted = await req.payload.delete({
            collection: 'notificationsSetting',
            where: { user: { equals: id } },
          });
          // req.payload.logger.info(`Deleted ${notificationsDeleted.docsDeleted} notificationsSetting for user ${id}`);

          // Delete related deviceSync
          const deviceSyncDeleted = await req.payload.delete({
            collection: 'deviceSync',
            where: { user: { equals: id } },
          });
          // req.payload.logger.info(`Deleted ${deviceSyncDeleted.docsDeleted} deviceSync for user ${id}`);

        } catch (err) {
          // Log the error but do not block deletion
          req.payload.logger.error(`Failed to delete related data for user ${id}: ${err}`);
        }
      },
    ],
  },

  endpoints: customUserEndpoints,
}

export default Users
