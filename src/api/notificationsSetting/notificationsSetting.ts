import type { PayloadHandler } from 'payload'

export const getNotificationsSetting: PayloadHandler = async (req) => {
  try {
    if (!req.user) {
      return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const notifications = await req.payload.find({
      collection: 'notificationsSetting',
      where: { user: { equals: req.user.id } },
      limit: 1,
    })

    if (!notifications.docs.length) {
      return Response.json(
        {
          success: true,
          message: 'No notification settings found for this user.',
          notifications: null,
        },
        { status: 200 }
      )
    }

    return Response.json(
      {
        success: true,
        notifications: notifications.docs[0],
      },
      { status: 200 }
    )
  } catch (err: any) {
    console.error('Error in getNotificationsSetting:', err)
    return Response.json(
      { success: false, message: 'Internal server error', error: err.message },
      { status: 500 }
    )
  }
}

export const updateNotificationsSettings: PayloadHandler = async (req) => {
  try {
    if (!req.user) {
      return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    const notifications = await req.payload.find({
      collection: 'notificationsSetting',
      where: { user: { equals: req.user.id } },
      limit: 1,
    })

    let updated
    if (notifications.docs.length) {
      updated = await req.payload.update({
        collection: 'notificationsSetting',
        id: notifications.docs[0].id,
        data: body,
        overrideAccess: true,
        user: req.user,
      })
    } else {
      updated = await req.payload.create({
        collection: 'notificationsSetting',
        data: { ...body, user: req.user.id },
        overrideAccess: true,
        user: req.user,
      })
    }

    return Response.json(
      {
        success: true,
        message: 'Notifications updated successfully.',
        notifications: updated,
      },
      { status: 200 }
    )
  } catch (err: any) {
    console.error('Error in updateNotificationsSettings:', err)
    return Response.json(
      { success: false, message: 'Internal server error', error: err.message },
      { status: 500 }
    )
  }
}
