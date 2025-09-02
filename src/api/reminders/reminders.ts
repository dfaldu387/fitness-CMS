import type { PayloadHandler } from 'payload'

export const getReminders: PayloadHandler = async (req) => {
  try {
    if (!req.user) {
      return Response.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const reminders = await req.payload.find({
      collection: 'reminders',
      where: { user: { equals: req.user.id } },
      limit: 1,
    })

    if (!reminders.docs.length) {
      return Response.json(
        {
          success: true,
          message: 'No reminders found for this user.',
          reminders: null,
        },
        { status: 200 }
      )
    }

    return Response.json(
      {
        success: true,
        reminders: reminders.docs[0],
      },
      { status: 200 }
    )
  } catch (err: any) {
    return Response.json(
      {
        success: false,
        message: 'Internal server error',
        error: err.message,
      },
      { status: 500 }
    )
  }
}

export const updateReminders: PayloadHandler = async (req) => {
  try {
    if (!req.user) {
      return Response.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()

    const reminders = await req.payload.find({
      collection: 'reminders',
      where: { user: { equals: req.user.id } },
      limit: 1,
    })

    let updated
    if (reminders.docs.length) {
      updated = await req.payload.update({
        collection: 'reminders',
        id: reminders.docs[0].id,
        data: body,
        overrideAccess: true,
        user: req.user,
      })
    } else {
      updated = await req.payload.create({
        collection: 'reminders',
        data: { ...body, user: req.user.id },
        overrideAccess: true,
        user: req.user,
      })
    }

    return Response.json(
      {
        success: true,
        message: 'Reminders updated successfully.',
        reminders: updated,
      },
      { status: 200 }
    )
  } catch (err: any) {
    return Response.json(
      { success: false, message: 'Internal server error', error: err.message },
      { status: 500 }
    )
  }
}