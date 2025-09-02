import type { PayloadHandler } from 'payload'

export const forgotPassword: PayloadHandler = async (req) => {
    try {
        const body = await req.json()
        const { email, password } = body

        if (!email || !password) {
            return Response.json(
                { success: false, message: 'Email and password are required.' },
                { status: 400 }
            )
        }

        //  Find the user by email
        const users = await req.payload.find({
            collection: 'users',
            where: {
                email: {
                    equals: email,
                },
            },
            limit: 1,
        })

        if (!users.docs || users.docs.length === 0) {
            return Response.json(
                { success: false, message: 'User not found with this email.' },
                { status: 404 }
            )
        }

        const user = users.docs[0]

        await req.payload.update({
            collection: 'users',
            id: user.id,
            data: { password },
        })

        return Response.json({
            success: true,
            message: 'Password reset successfully.',
        })
    } catch (err: any) {
        console.error('forgotPassword error >>>', err)
        return Response.json(
            { success: false, message: 'Password reset failed', error: err.message },
            { status: 500 }
        )
    }
}
