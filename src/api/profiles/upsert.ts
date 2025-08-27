import type { PayloadRequest } from 'payload'

export async function upsertProfile(req: PayloadRequest): Promise<Response> {
  try {
    if (!req.user) return Response.json({ message: 'Unauthorized' }, { status: 401 })

    const body = await (req as any).json?.()
    const partial: Record<string, unknown> = {}

    // All fields optional — only set what is provided
    if (typeof body?.preferredName === 'string') partial.preferredName = body.preferredName
    if (typeof body?.gender === 'string')        partial.gender = body.gender
    if (typeof body?.birthdate === 'string')     partial.birthdate = body.birthdate // ISO date

    // Do we already have a profile for this user?
    const existing = await req.payload.find({
      collection: 'profiles',
      where: { user: { equals: req.user.id } },
      limit: 1,
    })

    if (existing.docs.length === 0) {
      // Create — user field will be injected by the collection hook if omitted
      const created = await req.payload.create({
        collection: 'profiles',
        data: { ...partial },
        overrideAccess: true,
      })
      return Response.json({ ok: true, profile: created }, { status: 201 })
    } else {
      // Update
      const prof = existing.docs[0]
      const updated = await req.payload.update({
        collection: 'profiles',
        id: prof.id,
        data: partial,
        overrideAccess: true,
      })
      return Response.json({ ok: true, profile: updated }, { status: 200 })
    }
  } catch (err) {
    req.payload.logger.error(err)
    return Response.json({ message: 'Failed to upsert profile' }, { status: 500 })
  }
}
