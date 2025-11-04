import { ChatServieces } from './chat.rest.service';
import { Router } from "express";




const router=Router()
export const chatRoutes={
    base:"/chats"
}

const chatServieces= new ChatServieces()









export default router