import type { PayloadRequest } from 'payload'

export async function verifyOtp(req: PayloadRequest): Promise<Response> {
  try {
    const body = await (req as any).json?.()
    const email = (body?.email as string | undefined)?.toLowerCase()
    const otp = body?.otp as string | undefined
    if (!email || !otp) {
      return Response.json({ message: 'Email and OTP are required' }, { status: 400 })
    }

    const found = await req.payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      limit: 1,
    })
    if (!found.docs.length) return Response.json({ message: 'User not found' }, { status: 404 })

    const user = found.docs[0]
    const now = Date.now()
    const otpExpires = user.email_otp_expires_at ? new Date(user.email_otp_expires_at).getTime() : 0

    if (!user.email_otp_hash || otpExpires < now) {
      return Response.json({ message: 'OTP expired or not generated' }, { status: 400 })
    }

    if ((user.email_otp_attempts ?? 0) >= 5) {
      return Response.json({ message: 'Maximum OTP attempts exceeded' }, { status: 429 })
    }

    if (user.email_otp_hash !== otp) {
      await req.payload.update({
        collection: 'users',
        id: user.id,
        data: { email_otp_attempts: (user.email_otp_attempts ?? 0) + 1 },
        overrideAccess: true,
      })
      return Response.json({ message: 'Invalid OTP' }, { status: 400 })
    }

    await req.payload.update({
      collection: 'users',
      id: user.id,
      data: {
        _verified: true,
        _verificationToken: null,
        email_otp_hash: null,
        email_otp_expires_at: null,
        email_otp_attempts: 0,
        email_otp_last_sent_at: null,
      },
      overrideAccess: true,
    })

    return Response.json({ ok: true, message: 'OTP verified successfully' }, { status: 200 })
  } catch (err) {
    req.payload.logger.error(err)
    return Response.json({ message: 'Failed to verify OTP' }, { status: 500 })
  }
}
