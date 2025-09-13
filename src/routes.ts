import { Router } from "express";
import router from "./modules/userModule/user.controller";
const baseRouter=Router()

baseRouter.use('/users',router)



export default baseRouter