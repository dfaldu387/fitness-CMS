import type { PayloadHandler } from 'payload';

export const dataCollection: PayloadHandler = async (req) => {
  try {
    const body = await req.json()
    const { preferredName, gender, birthdate, location, email } = body

    // 1️⃣ Validate input
    if (!email) {
      return Response.json(
        { success: false, message: 'Email is required.' },
        { status: 400 }
      )
    }

    // 🔎 Step 1: Find user by email in the 'users' collection
    const userExists = await req.payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      limit: 1,
      overrideAccess: true,
    });

    if (!userExists?.docs || userExists.docs.length === 0) {
      // If the user does not exist, return a '404 Not Found' response
      return Response.json({ message: 'User with this email not found' }, { status: 404 });
    }

    const userId = userExists.docs[0].id;

    // 🔎 Step 2: Check if the profile exists for the user
    const profileExists = await req.payload.find({
      collection: 'profiles',
      where: { user: { equals: userId } },
      limit: 1,
    });

    console.log('Profile existence check:', profileExists);

    let profileData: any = {
      user: userId,
      preferredName,
      gender,
      birthdate,
      location,
    };

    // ✅ If profile exists, update it with the new data
    if (profileExists.docs.length > 0) {
      const existingProfile = profileExists.docs[0];

      // Merge the existing profile data with the new data (update parameters)
      profileData = {
        ...existingProfile,
        preferredName: preferredName ?? existingProfile.preferredName,
        gender: gender ?? existingProfile.gender,
        birthdate: birthdate ?? existingProfile.birthdate,
        location: location ?? existingProfile.location,
      };

console.log('profileData>>>>>>>',profileData);


      // Update the existing profile
      const updatedProfile = await req.payload.update({
        collection: 'profiles',
        id: existingProfile.id, // Use existing profile ID to update
        data: profileData,
        overrideAccess: true, // Ensure access rules are applied
        user: req.user, // Keep track of who is updating
      });

      console.log('updatedProfile???????????',updatedProfile);
      

      return Response.json(
        { message: 'Profile updated successfully', profile: updatedProfile },
        { status: 200 }
      );
    }

    // ✅ Step 3: If no profile exists, create a new profile
    const newProfile = await req.payload.create({
      collection: 'profiles',
      data: profileData,
      overrideAccess: true, // Ensure access rules are applied
      user: req.user, // Track who is creating the profile
    });

    console.log('Created profile:', newProfile);

    return Response.json(
      { message: 'Profile created successfully', profile: newProfile },
      { status: 201 }
    );

  } catch (err: any) {
    // Log error for debugging
    console.error('Error during profile creation or update:', err);

    return Response.json(
      { message: 'Internal server error', error: err?.message },
      { status: 500 }
    );
  }
};
