import type { PayloadHandler } from 'payload'

import { signup } from './signup'
import { login } from './login'
import { sendOtp } from './send-otp'
import { resendOtp } from './resend-otp'
import { verifyOtp } from './verify-otp'
import { myProfile } from './my-profile'
import { updateAccountInfo } from './update-accountinfo'
// import { updatePassword } from './update-password'

export const customUserEndpoints: { path: string; method: any; handler: PayloadHandler }[] = [
    { path: '/custom-signup', method: 'post', handler: signup },
    { path: '/custom-login', method: 'post', handler: login },
    { path: '/send-otp', method: 'post', handler: sendOtp },
    { path: '/resend-otp', method: 'post', handler: resendOtp },
    { path: '/verify-otp', method: 'post', handler: verifyOtp },
    { path: '/my-profile', method: 'get', handler: myProfile },
    { path: '/update-accountinfo', method: 'patch', handler: updateAccountInfo },
    // { path: '/update-password', method: 'patch', handler: updatePassword },
]
