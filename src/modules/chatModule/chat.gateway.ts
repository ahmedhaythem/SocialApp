import { ChatEvent } from './chat.events';
import { Socket } from "socket.io";
import { AuthenticationSocket } from "../gateway/gateway";



export class ChatGateway{
    private chatEvent=new ChatEvent()
    constructor(){}
    register=(socket:AuthenticationSocket )=>{
        this.chatEvent.sendMessage(socket)
    }
}