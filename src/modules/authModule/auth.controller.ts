import { auth } from './../../middleware/auth.middleware';
import { validation } from '../../middleware/validation.middleware';
import { AuthServices } from './auth.service';
import { Router } from "express";
import * as authValidation from './auth.validation';
import { uploadFile } from '../../utils/multer/multer';
const router= Router()

const authServices=new AuthServices()


router.post('/signup',validation(authValidation.signupSchema),authServices.signUp)
router.post('/login',validation(authValidation.loginSchema),authServices.login)
router.patch('/confirm-email',authServices.confirmEmail)
router.patch("/resend-otp",validation(authValidation.resendOtp),authServices.resendOtp)
router.get("/me",auth(),authServices.getUser)
router.post("/refresh-token",authServices.refreshToken)
router.patch("/forget-password",validation(authValidation.forgetPasswordSchema),authServices.forgetPassword)
router.patch("/reset-password",authServices.resetPassword)
router.patch('/profile-image',auth(),uploadFile({}).single("image"),authServices.profileImage)
export default router 