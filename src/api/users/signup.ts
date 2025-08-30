import type { PayloadHandler } from 'payload'

export const signup: PayloadHandler = async (req) => {
    try {
        const body = await req.json()
        const { email, password, name, birthdate, acceptedTerms } = body

        //  Validate input
        if (!email || !password || !name) {
            return Response.json(
                { success: false, message: 'Name, email, and password are required.' },
                { status: 400 }
            )
        }

        //  Check if user already exists
        const existingUser = await req.payload.find({
            collection: 'users',
            where: { email: { equals: email } },
            limit: 1,
        })

        if (existingUser.totalDocs > 0) {
            return Response.json(
                {
                    success: false, message: 'User already exists!!!',
                    user: existingUser.docs[0]
                },

                { status: 409 }
            )
        }

        //  Create user with _verified: false
        const newUser = await req.payload.create({
            collection: 'users',
            data: {
                email,
                password,
                name,
                birthdate,
                acceptedTerms,
                _verified: false,
                email_otp_attempts: 0,
            },
        })

        // const SIGN_SECRET = process.env.PAYLOAD_SECRET || process.env.JWT_SECRET
        // if (!SIGN_SECRET) {
        //     return Response.json(
        //         { success: false, message: 'Server misconfiguration: missing JWT secret' },
        //         { status: 500 })
        // }

        // const tokenPayload = {
        //     id: newUser.id,
        //     collection: 'users',
        //     email: newUser.email,
        // }
        // const expiresIn = process.env.SIGNUP_TOKEN_EXPIRES_IN || '7d'
        // const token = jwt.sign(tokenPayload, SIGN_SECRET, { expiresIn })

        return Response.json({
            success: true,
            message: 'Signup successful. Please verify your email with OTP before logging in.',
            user: {
                id: newUser.id,
                userId: newUser.userId,
                email: newUser.email,
                verified: newUser._verified,
            },
            // token

        })
    } catch (err: any) {
        return Response.json(
            { success: false, message: 'Signup failed', error: err.message },
            { status: 500 }
        )
    }
}
