import { Router } from "express";
import router from "./modules/authModule/auth.controller";
const baseRouter=Router()

baseRouter.use('/auth',router)



export default baseRouter