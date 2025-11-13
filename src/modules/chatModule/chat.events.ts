import { AuthenticationSocket } from "../gateway/gateway";
import { ChatSocketServieces } from "./chat.socket.service";




export class ChatEvent{
    private chatSocketServieces=new ChatSocketServieces()
    constructor(){}


    sendMessage=async(socket:AuthenticationSocket )=>{
        socket.on("sendMessage",(data)=>{
            return this.chatSocketServieces.sendMessage(socket, data)
        })

    }
}