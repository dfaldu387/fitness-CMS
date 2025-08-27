import type { PayloadHandler } from 'payload'

export const myProfile: PayloadHandler = async (req) => {
    try {
        if (!req.user) {
            return Response.json(
                { success: false, message: 'Unauthorized. Please login first.' },
                { status: 401 }
            )
        }

        // fetch using custom userId field
        const userRes = await req.payload.find({
            collection: 'users',
            where: { email: { equals: req.user.email } },
            limit: 1,
        })

        if (userRes.totalDocs === 0) {
            return Response.json(
                { success: false, message: 'User not found.' },
                { status: 404 }
            )
        }

        const user = userRes.docs[0]

        return Response.json({
            success: true,
            profile: { user }
        })
    } catch (err: any) {
        return Response.json(
            { success: false, message: 'Failed to fetch profile', error: err.message },
            { status: 500 }
        )
    }
}
