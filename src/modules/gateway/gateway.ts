import { HydratedDocument } from "mongoose"
import { IUser } from "../../DB/models/user.model"
import { Server, Socket } from "socket.io"
import {Server as httpServer} from "node:http"
import { decodeToken, TokenTypesEnum } from "../../middleware/auth.middleware"
import { ChatGateway } from "../chatModule/chat.gateway"


export interface AuthenticationSocket extends Socket{
        user?:HydratedDocument<IUser>
    }



const connectedSockets= new Map<string,string[]>()




const connect=(socket:AuthenticationSocket)=>{
    const currentSockets=connectedSockets.get(socket.user?._id.toString() as string) || []
    currentSockets.push(socket.id)

    connectedSockets.set(socket.user?._id.toString() as string,[socket.id])
}

const disconnect=(socket:AuthenticationSocket)=>{
    socket.on('disconnect',()=>{
            let currentSockets=connectedSockets.get(socket.user?._id.toString() as string) || []
            currentSockets=currentSockets.filter(id=>{
                return id !=socket.id
            })
            connectedSockets.set(socket.user?.toString() as string, currentSockets)
        })
}



export const inilialize=(httpServer:httpServer)=>{
    const chatGateway=new ChatGateway()

    const io=new Server(httpServer,{
        cors:{
            origin:'*'
        }
    })


    io.use(async (socket:AuthenticationSocket,next)=>{

        try {
            const data=await decodeToken({authorization:socket.handshake.auth.authorization,tokenTypes:TokenTypesEnum.access})
            socket.user=data.user
            next()
            
        } catch (error) {
            next(error as Error)
        }

    })


    io.on("connection",(socket:AuthenticationSocket)=>{
        chatGateway.register(socket)
        connect(socket)
        disconnect(socket)

    }) 
}