import type { PayloadHandler } from 'payload';
import { getPayloadHMR } from '@payloadcms/next/utilities';
import config from '@/payload.config';

export const updatePassword: PayloadHandler = async (req) => {
  try {
    const payload = await getPayloadHMR({ config });
    const body = await req.json();
    const { userId, oldPassword, password, confirmPassword } = body;

    if (!userId || !oldPassword || !password || !confirmPassword) {
      return Response.json({ success: false, message: 'All fields are required.' }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return Response.json({ success: false, message: 'Passwords do not match.' }, { status: 400 });
    }

    // Fetch user
    const userRes = await payload.find({
      collection: 'users',
      where: { userId: { equals: userId } },
      limit: 1,
      overrideAccess: true,
      fields: ['id', 'password'],
    });

    if (!userRes.docs?.length) {
      return Response.json({ success: false, message: 'User not found.' }, { status: 404 });
    }

    const user = userRes.docs[0];

    console.log('user***********', user);

    if (!user.password) {
      return Response.json({ success: false, message: 'User has no password set.' }, { status: 400 });
    }

    // Verify old password
    const isOldPasswordCorrect = await payload.auth.verifyUserPassword({
      collection: 'users',
      user,
      password: oldPassword,
    });

    if (!isOldPasswordCorrect) {
      return Response.json({ success: false, message: 'Old password is incorrect.' }, { status: 400 });
    }

    // Update password (Payload auto-hashes)
    await payload.update({
      collection: 'users',
      id: user.id,
      data: { password },
      overrideAccess: true,
    });

    return Response.json({ success: true, message: 'Password updated successfully.' });
  } catch (err: any) {
    console.error(err);
    return Response.json({ success: false, message: 'Internal server error', error: err.message }, { status: 500 });
  }
};
