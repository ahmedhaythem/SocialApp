import z from "zod";
import { forgetPasswordSchema, loginSchema, resendOtp } from "./auth.validation";


export type resendOtpDTO=z.infer<typeof resendOtp>
export type loginDTO=z.infer<typeof loginSchema>
export type forgetPasswordDTO=z.infer<typeof forgetPasswordSchema>