import type { PayloadRequest } from 'payload'
import { gen4, RESEND_COOLDOWN_SECONDS, fmt } from '../../lib/otp'

export async function sendOtp(req: PayloadRequest): Promise<Response> {
    try {
        const body = await (req as any).json?.()
        const email = (body?.email as string | undefined)?.toLowerCase()
        if (!email) return Response.json({ message: 'Email is required' }, { status: 400 })

        const found = await req.payload.find({
            collection: 'users',
            where: { email: { equals: email } },
            limit: 1,
        })
        if (!found.docs.length) return Response.json({ ok: true }, { status: 200 })

        const user = found.docs[0]
        const now = Date.now()

        // Cooldown
        const lastSent = user.emailOtpLastSentAt ? new Date(user.emailOtpLastSentAt).getTime() : 0
        if (lastSent) {
            const elapsed = now - lastSent
            const cooldownMs = RESEND_COOLDOWN_SECONDS * 1000
            if (elapsed < cooldownMs) {
                const remainingSec = Math.ceil((cooldownMs - elapsed) / 1000)
                return Response.json(
                    { message: `Please try again in ${fmt(remainingSec)}.`, secondsRemaining: remainingSec },
                    { status: 429 },
                )
            }
        }

        // OTP + expiry
        const code = gen4()
        const expiresAt = new Date(now + 10 * 60 * 1000).toISOString()

        await req.payload.update({
            collection: 'users',
            id: user.id,
            data: {
                emailOtpHash: code, // hash in prod
                emailOtpExpiresAt: expiresAt,
                emailOtpAttempts: 0,
                emailOtpLastSentAt: new Date(now).toISOString(),
            },
        })

        console.log(`OTP for ${email}: ${code}`)

        await req.payload.sendEmail?.({
            to: email,
            subject: 'Your verification code',
            html: `<p>Your OTP is <b>${code}</b> (valid 10 minutes)</p>`,
        })

        const isProd = process.env.NODE_ENV === 'production'
        return Response.json(isProd ? { ok: true } : { ok: true, code }, { status: 200 })
    } catch (err) {
        req.payload.logger.error(err)
        return Response.json({ message: 'Failed to send code' }, { status: 500 })
    }
}
