import type { PayloadHandler } from 'payload';

export const createProfile = async (req: any) => {
  try {
    // ✅ Ensure body is parsed
    const body = req.body
    if (!body) {
      return Response.json({ message: 'No data provided' }, { status: 400 });
    }

    const { preferredName, gender, birthdate, location } = body;

    console.log('Received body:', preferredName, gender, birthdate, location);

    // 🔴 Unauthorized
    if (!req.user) {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // 🔎 Find user by email
    const email = req.user.email;
    const userExists = await req.payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      limit: 1,
      overrideAccess: true,
    });

    console.log('User found:', userExists);

    if (!userExists?.docs || userExists.docs.length === 0) {
      return Response.json({ message: 'User with this email not found' }, { status: 404 });
    }

    const userId = userExists.docs[0].id;

    // 🔎 Check if profile already exists
    const profileExists = await req.payload.find({
      collection: 'profiles',
      where: { user: { equals: userId } },
      limit: 1,
    });

    console.log('Profile existence check:', profileExists);

    if (profileExists.docs.length > 0) {
      return Response.json({ message: 'Profile already exists for this user' }, { status: 409 });
    }

    // ✅ Collect profile data
    const profileData: any = {
      user: userId,
      preferredName,
      gender,
      birthdate,
      location,
    };

    console.log('profileData??????????', profileData);


    // 🔨 Create profile
    const newProfile = await req.payload.create({
      collection: 'profiles',
      data: profileData,
      overrideAccess: false, // Ensure access rules are enforced
      user: req.user, // Keep track of who created the profile
    });

    console.log('Created profile:', newProfile);

    return Response.json(
      { message: 'Profile created successfully', profile: newProfile },
      { status: 201 }
    );

  } catch (err: any) {
    console.error('Error during profile creation:', JSON.stringify(err, null, 2));
    return Response.json(
      { message: 'Internal server error', error: err?.message },
      { status: 500 }
    );
  }
};
