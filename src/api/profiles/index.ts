import type { PayloadHandler } from 'payload'

import { dataCollection } from './data-collection'

export const customProfileEndpoints: { path: string; method: any; handler: PayloadHandler }[] = [
    { path: '/data-collection', method: 'post', handler: dataCollection },

]
