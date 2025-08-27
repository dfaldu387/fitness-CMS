import type { PayloadRequest } from 'payload'

export async function getMyProfile(req: PayloadRequest): Promise<Response> {
  try {
    if (!req.user) return Response.json({ message: 'Unauthorized' }, { status: 401 })

    const found = await req.payload.find({
      collection: 'profiles',
      where: { user: { equals: req.user.id } },
      limit: 1,
    })

    if (!found.docs.length) return Response.json({ ok: true, profile: null }, { status: 200 })
    return Response.json({ ok: true, profile: found.docs[0] }, { status: 200 })
  } catch (err) {
    req.payload.logger.error(err)
    return Response.json({ message: 'Failed to fetch profile' }, { status: 500 })
  }
}
