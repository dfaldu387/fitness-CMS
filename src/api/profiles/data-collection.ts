import type { PayloadHandler } from 'payload';

export const dataCollection: PayloadHandler = async (req) => {
  try {
    const body = await req.json()
    const {
      email,
      preferredName,
      gender,
      birthdate,
      location,
      height,
      healthCondition,
      allergies,
      exerciseLimitation,
      wellnessGoals,
      dietaryRestrictions, } = body

    if (!email) {
      return Response.json(
        { success: false, message: 'Email is required.' },
        { status: 400 }
      )
    }

    //  Find user by email in the 'users' collection
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

    // Check if the profile exists for the user
    const profileExists = await req.payload.find({
      collection: 'profiles',
      where: { user: { equals: userId } },
      limit: 1,
    });

    let profileData: any = {
      user: userId,
      preferredName,
      gender,
      birthdate,
      location,
      height,
      healthCondition,
      allergies,
      exerciseLimitation,
      wellnessGoals,
      dietaryRestrictions,
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
        height: height ?? existingProfile.height,
        healthCondition: healthCondition ?? existingProfile.healthCondition,
        allergies: allergies ?? existingProfile.allergies,
        exerciseLimitation: exerciseLimitation ?? existingProfile.exerciseLimitation,
        wellnessGoals: wellnessGoals ?? existingProfile.wellnessGoals,
        dietaryRestrictions: dietaryRestrictions ?? existingProfile.dietaryRestrictions,
      };

      // Update the existing profile
      const updatedProfile = await req.payload.update({
        collection: 'profiles',
        id: existingProfile.id,
        data: profileData,
        overrideAccess: true,
        user: req.user,
      });

      return Response.json(
        { message: 'Profile updated successfully', profile: updatedProfile },
        { status: 200 }
      );
    }

    //  If no profile exists, create a new profile
    const newProfile = await req.payload.create({
      collection: 'profiles',
      data: profileData,
      overrideAccess: true,
      user: req.user,
    });


    return Response.json(
      { message: 'Profile created successfully', profile: newProfile },
      { status: 201 }
    );

  } catch (err: any) {
    return Response.json(
      { message: 'Internal server error', error: err?.message },
      { status: 500 }
    );
  }
};
