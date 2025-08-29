import type { CollectionConfig } from 'payload';
import { customProfileEndpoints } from '@/api/profiles';

const DataCollection: CollectionConfig = {
  slug: 'profiles',
  admin: {
    useAsTitle: 'preferredName',
    defaultColumns: [
      'user',
      'preferredName',
      'gender',
      'birthdate',
      'location',
      'dietaryRestrictions',
      'wellnessGoals',
      'exerciseLimitation',
      'allergies',
      'healthCondition',
      'height',
    ],
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
    { 
  name: 'birthdate', 
  type: 'date', 
  label: 'Birthdate', 
  required: false, 
  admin: { date: { pickerAppearance: 'dayOnly' } } 
},
    { name: 'location', type: 'text', label: 'Country' },
    { name: 'height', type: 'text', label: 'height' },
    { name: 'healthCondition', type: 'text', label: 'healthCondition' },
    { name: 'allergies', type: 'text', label: 'allergies' },
    { name: 'exerciseLimitation', type: 'text', label: 'exerciseLimitation?' },
    { name: 'wellnessGoals', type: 'text', label: 'wellnessGoals' },
    { name: 'dietaryRestrictions', type: 'text', label: 'dietaryRestrictions' },
  ],
  hooks: {
  beforeChange: [
    async ({ req, data, operation }) => {
      if (operation === 'create' && !data.user && req.user) {
        data.user = req.user.id;
      }

      // ✅ Fix invalid date values
      if (data.birthdate === '' || data.birthdate === undefined) {
        data.birthdate = null;
      }

      return data;
    },
  ],
},

  endpoints: customProfileEndpoints,
};

export default DataCollection;