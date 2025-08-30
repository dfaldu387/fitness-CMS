import type { PayloadHandler } from 'payload'
import { getNewsDashboardById } from './getNewsDashboardById'

export const customNewsDashboardEndpoints: { path: string; method: any; handler: PayloadHandler }[] = [
  { path: '/get-newsDashboard-by-id', method: 'get', handler: getNewsDashboardById },
]
