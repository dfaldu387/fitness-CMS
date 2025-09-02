import type { PayloadHandler } from 'payload'

export const updatePassword: PayloadHandler = async (req) => {
  try {
    if (!req.user) {
      return Response.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { oldPassword, confirmNewPassword } = body

    if (!oldPassword || !confirmNewPassword) {
      return Response.json(
        { success: false, message: 'Old and new passwords are required.' },
        { status: 400 }
      )
    }

    try {
      await req.payload.login({
        collection: 'users',
        data: {
          email: req.user.email,
          password: oldPassword,
        },
      })
    } catch {
      return Response.json(
        { success: false, message: 'Old password is incorrect.' },
        { status: 400 }
      )
    }

    await req.payload.update({
      collection: 'users',
      id: req.user.id,
      data: { password: confirmNewPassword },
    })

    return Response.json({
      success: true,
      message: 'Password updated successfully.',
    })
  } catch (err: any) {
    console.error('updatePassword error >>>', err)
    return Response.json(
      { success: false, message: 'Password update failed', error: err.message },
      { status: 500 }
    )
  }
}
