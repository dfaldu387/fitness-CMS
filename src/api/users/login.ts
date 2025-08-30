import type { PayloadHandler } from 'payload'
import bcrypt from 'bcryptjs';

export const login: PayloadHandler = async (req) => {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return Response.json(
        { success: false, message: 'Email and password are required.' },
        { status: 400 }
      )
    }

    const existing = await req.payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      limit: 1,
    })

    if (existing.totalDocs === 0) {
      return Response.json(
        { success: false, message: 'User not found.' },
        { status: 404 }
      )
    }

    const user = existing.docs[0]

    console.log('user00000000000', user);

    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedOldPassword = await bcrypt.hash(user?.password, 10);
    console.log('hashedPassword?????', hashedPassword);
    console.log('hashedOldPassword?????', hashedOldPassword);


    // const isMatch = await bcrypt.compare(user.password, hashedPassword);

    if (isMatch) {
      console.log("✅ Passwords match!");
    } else {
      console.log("❌ Invalid password");
    }

    if (!user._verified) {
      return Response.json(
        { success: false, message: 'Please verify OTP on your email before logging in.' },
        { status: 401 }
      )
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return Response.json(
        { success: false, message: 'Invalid password.' },
        { status: 401 }
      );
    }

    const loginRes = await req.payload.login({
      collection: 'users',
      data: { email, password },
    })

    return Response.json({
      success: true,
      message: 'Login successful!!!',
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        userId: user.userId,
        password: user.password
      },
      token: loginRes.token,
    })
  } catch (err: any) {
    return Response.json(
      { success: false, message: 'Login failed', error: err.message },
      { status: 500 }
    )
  }
}
