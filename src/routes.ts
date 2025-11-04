import { Router } from "express";
import authRouter from "./modules/authModule/auth.controller";
import postRouter, { postRoutes } from "./modules/postModule/post.controller";
import { chatRouter, chatRoutes } from "./modules";
const baseRouter=Router()

baseRouter.use('/auth',authRouter)
baseRouter.use(postRoutes.base,postRouter)
baseRouter.use(chatRoutes.base,chatRouter)



export default baseRouter