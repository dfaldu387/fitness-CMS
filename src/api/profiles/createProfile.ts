import type { PayloadRequest } from 'payload'

export async function createProfile(req: PayloadRequest, res: any): Promise<any> {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const body = req.body || {}
    console.log('body************', body)

    // All known optional fields
    const data: Record<string, unknown> = {}
    if (typeof body.preferredName === 'string') data.preferredName = body.preferredName
    if (typeof body.gender === 'string') data.gender = body.gender
    if (typeof body.birthdate === 'string') data.birthdate = body.birthdate
    if (typeof body.location === 'string') data.location = body.location

    // Any unknown fields -> put inside `extra`
    const knownKeys = ['preferredName', 'gender', 'birthdate', 'location', 'user']
    const extra: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(body)) {
      if (!knownKeys.includes(key)) {
        extra[key] = value
      }
    }
    if (Object.keys(extra).length > 0) data.extra = extra

    // Always link to logged-in user
    const userId =
      body.user && req.user?.role === 'admin'
        ? body.user // admin override
        : req.user.id

    const created = await req.payload.create({
      collection: 'profiles',
      data: {
        ...data,
        user: userId,
      },
      overrideAccess: true,
    })

    return res.status(201).json({ ok: true, profile: created })
  } catch (err: any) {
    req.payload.logger.error(err)
    console.error('Error creating profile:', err)
    return res.status(500).json({ message: 'Failed to create profile', error: err.message })
  }
}
