import { AuthenticationSocket } from "../gateway/gateway";
import { ChatSocketServieces } from "./chat.socket.service";




export class ChatEvent{
    private chatSocketServieces=new ChatSocketServieces()
    constructor(){}


    sayHi=(socket:AuthenticationSocket)=>{
        socket.on('sayHi',(message:string, callback:Function)=>{
            return this.chatSocketServieces.sayHi(message,callback)
        })
    }
}