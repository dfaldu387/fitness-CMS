import { customDeviceSyncEndpoints } from '@/api/deviceSync'
import type { CollectionConfig } from 'payload'

const DeviceSync: CollectionConfig = {
  slug: 'deviceSync',
  admin: {
    defaultColumns: [
      'id',
      'syncIphone',
      'syncAppleWatch',
      'syncAppleHealthKit',
      'syncAndroid',
      'syncAndroidFit',
      'syncSamsungSmartWatch',
      'syncFitbit',
      'syncOuraRing',
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
      name: 'syncIphone',
      label: 'Sync iPhone',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'syncAppleWatch',
      label: 'Sync Apple Watch',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'syncAppleHealthKit',
      label: 'Sync Apple Health Kit',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'syncAndroid',
      label: 'Sync Android',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'syncAndroidFit',
      label: 'Sync Android Fit',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'syncSamsungSmartWatch',
      label: 'Sync Samsung Smart Watch',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'syncFitbit',
      label: 'Sync Fitbit',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'syncOuraRing',
      label: 'Sync Oura Ring',
      type: 'checkbox',
      defaultValue: false,
    },
  ],

  endpoints: customDeviceSyncEndpoints,
}
export default DeviceSync
