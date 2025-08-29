import type { PayloadHandler } from 'payload';
import bcrypt from 'bcryptjs';

export const updatePassword: PayloadHandler = async (req) => {
  try {
    const body = await req.json();
    const { userId, oldPassword, password, confirmPassword } = body;

    // Validate fields
    if (!userId || !oldPassword || !password || !confirmPassword) {
      return Response.json({ success: false, message: 'All fields are required.' }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return Response.json({ success: false, message: 'Passwords do not match.' }, { status: 400 });
    }

    if (!req.user) {
      return Response.json({ success: false, message: 'Unauthorized.' }, { status: 401 });
    }

    // Fetch user with password
    const userRes = await req.payload.find({
      collection: 'users',
      where: { userId: { equals: userId } },
      limit: 1,
      overrideAccess: true,
      fields: ['id', 'password'],
    });

    if (!userRes.docs || userRes.docs.length === 0) {
      return Response.json({ success: false, message: 'User not found.' }, { status: 404 });
    }

    const user = userRes.docs[0];

    if (!user.password) {
      return Response.json({ success: false, message: 'User password not set.' }, { status: 400 });
    }

    // Compare old password
    const isOldPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordCorrect) {
      return Response.json({ success: false, message: 'Old password is incorrect.' }, { status: 400 });
    }

    // Update password (Payload will hash automatically)
    await req.payload.update({
      collection: 'users',
      id: user.id,
      data: { password },
      overrideAccess: true,
    });

    return Response.json({ success: true, message: 'Password updated successfully.' }, { status: 200 });
  } catch (err: any) {
    return Response.json({ success: false, message: 'Internal server error', error: err.message }, { status: 500 });
  }
};
