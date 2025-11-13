import { auth } from '../../middleware/auth.middleware';
import { ChatServieces } from './chat.rest.service';
import { Router } from "express";




const router=Router({
    mergeParams:true
})
export const chatRoutes={
    base:"/chats",
    getChat:"/"
}

const chatServieces= new ChatServieces()


router.get(
    chatRoutes.getChat,
    auth(),
    chatServieces.getChat
)






export default router