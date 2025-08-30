import { getPayloadHMR } from '@payloadcms/next/utilities';
import config from '@/payload.config';

export const getNewsDashboardById = async (req: Request) => {
    try {
        const payload = await getPayloadHMR({ config });

        const url = new URL(req.url);
        const userDocId = url.searchParams.get('userDocId');
        const userId = url.searchParams.get('userId');
        const email = url.searchParams.get('email');
        const type = url.searchParams.get('type') || undefined;

        const page = Math.max(parseInt(url.searchParams.get('page') ?? '1', 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') ?? '10', 10) || 10, 1), 100);

        let resolvedUserDocId = userDocId ?? null;

        if (!resolvedUserDocId) {
            if (!userId && !email) {
                return Response.json(
                    { success: false, message: 'Provide userDocId or userId or email.' },
                    { status: 400 }
                );
            }

            const where: any = {};
            if (userId) where.userId = { equals: userId };
            if (email) where.email = { equals: email };

            const userRes = await payload.find({
                collection: 'users',
                where,
                limit: 1,
            });

            if (!userRes.totalDocs) {
                return Response.json(
                    { success: false, message: 'User not found.' },
                    { status: 404 }
                );
            }
            resolvedUserDocId = String(userRes.docs[0].id);
        }

        const whereNews: any = { user: { equals: resolvedUserDocId } };
        if (type) whereNews.type = { equals: type };

        const news = await payload.find({
            collection: 'newsDashboard',
            where: whereNews,
            sort: '-date',
            page,
            limit,
            depth: 1,
        });

        const sanitized = news.docs.map(({ user, ...rest }) => rest);

        return Response.json({
            success: true,
            data: sanitized,
            pagination: {
                totalDocs: news.totalDocs,
                totalPages: news.totalPages,
                page: news.page,
                limit: news.limit,
                hasPrevPage: news.hasPrevPage,
                hasNextPage: news.hasNextPage,
                prevPage: news.prevPage,
                nextPage: news.nextPage,
                userId: userId
            },
        });
    } catch (e) {
        return Response.json({ success: false, message: (e as Error).message }, { status: 500 });
    }
};
