import type { PayloadHandler } from 'payload'

export const getDeviceSync: PayloadHandler = async (req) => {
    try {
        if (!req.user) {
            return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 })
        }

        const deviceSync = await req.payload.find({
            collection: 'deviceSync',
            where: { user: { equals: req.user.id } },
            limit: 1,
        })

        if (!deviceSync.docs.length) {
            return Response.json(
                { success: true, message: 'No device sync settings found', deviceSync: null },
                { status: 200 }
            )
        }

        return Response.json(
            { success: true, message: 'Device sync settings fetched successfully', deviceSync: deviceSync.docs[0] },
            { status: 200 }
        )
    } catch (err: any) {
        return Response.json(
            { success: false, message: 'Internal server error', error: err.message },
            { status: 500 }
        )
    }
}

export const updateDeviceSync: PayloadHandler = async (req) => {
  try {
    if (!req.user) {
      return Response.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await (req as any).json?.()
    if (!body) {
      return Response.json(
        { success: false, message: 'No data provided' },
        { status: 400 }
      )
    }

    // Check if device sync exists for this user
    const existing = await req.payload.find({
      collection: 'deviceSync',
      where: { user: { equals: req.user.id } },
      limit: 1,
    })

    let updated
    if (existing.docs.length > 0) {
      // Update existing record
      updated = await req.payload.update({
        collection: 'deviceSync',
        id: existing.docs[0].id,
        data: body,
        overrideAccess: true,
        user: req.user,
      })
    } else {
      // Create new record
      updated = await req.payload.create({
        collection: 'deviceSync',
        data: { ...body, user: req.user.id },
        overrideAccess: true,
        user: req.user,
      })
    }

    return Response.json(
      {
        success: true,
        message: 'Device sync settings updated successfully',
        deviceSync: updated,
      },
      { status: 200 }
    )
  } catch (err: any) {
    req.payload.logger.error(`Error in updateDeviceSync: ${err}`)
    return Response.json(
      { success: false, message: 'Internal server error', error: err.message },
      { status: 500 }
    )
  }
}
