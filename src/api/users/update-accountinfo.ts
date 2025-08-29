import type { PayloadHandler } from 'payload'

export const updateAccountInfo: PayloadHandler = async (req) => {
  try {
    // 1️⃣ Ensure the user is authenticated.
    // In a typical Payload CMS setup, `req.user` contains the authenticated user's document.
    const user = req.user;
    if (!user) {
      return Response.json(
        { success: false, message: 'Unauthorized.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, email } = body;

    if (!name && !email) {
      return Response.json(
        { success: false, message: 'Please provide at least a name or an email to update.' },
        { status: 400 }
      );
    }

    const updateData: Partial<any> = {};
    let updatedEmailMessage = '';

    if (email && email !== user.email) {
      const existingUserWithEmail = await req.payload.find({
        collection: 'users',
        where: { email: { equals: email } },
        limit: 1,
      });

      if (existingUserWithEmail.totalDocs > 0) {
        return Response.json(
          { success: false, message: `Email '${email}' is already in use by another user.` },
          { status: 409 }
        );
      }

      updateData.email = email;

      // Optionally, if your workflow requires email re-verification, you could add this:
      // updateData._verified = false;
      // updateData.email_otp_attempts = 0;
      // updatedEmailMessage = ' Your email has been updated. You may need to re-verify it for some services.';
    }

    if (name) {
      updateData.name = name;
    }
    const updatedUser = await req.payload.update({
      collection: 'users',
      id: user.id,
      data: updateData,
    });

    return Response.json({
      success: true,
      message: `Profile updated successfully.${updatedEmailMessage}`,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
      },
    });

  } catch (err: any) {
    return Response.json(
      { success: false, message: 'Failed to update profile.', error: err.message },
      { status: 500 }
    );
  }
}
