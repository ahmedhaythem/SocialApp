import { validation } from '../../middleware/validation.middleware';
import { UserServices } from './auth.service';
import { Router } from "express";
import { signupSchema } from './auth.validation';
const router= Router()

const userServices=new UserServices()


router.post('/signup',validation(signupSchema),userServices.signUp)
router.post('/login',userServices.login)
router.post('/confirm-email',userServices.confirmEmail)


export default router 