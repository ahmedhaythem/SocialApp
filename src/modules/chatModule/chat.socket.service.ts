import { Types } from "mongoose";
import { NotFoundException } from "../../utils/Error";
import { UserRepo } from "../authModule/auth.repo";
import { AuthenticationSocket } from "../gateway/gateway";
import { ChatRepo } from "./chat.reop";




export class ChatSocketServieces{
    private userModel=new UserRepo()
    private chatModel=new ChatRepo()
    constructor(){ }
    sendMessage=async(socket: AuthenticationSocket, data:{senTo:string, content:string})=>{
        try {
            const createdBy=socket.user?._id as Types.ObjectId
            const to= await this.userModel.findById({id:data.senTo})

            if(!to){
                throw new Error("user not found")
            }

            console.log({ createdBy, to: to._id });

            const chat =await this.chatModel.findOne({
                filter:{
                    participants:{
                        $all:[to._id, createdBy]
                    },
                    group:{
                        $exists:false
                    }
                }
                
            })

            console.log({ chat });
            
            if(!chat){
                throw new NotFoundException('chat not found')
            }

            
            chat.message.push({ content: data.content, createdBy });
            await chat.save();
        } catch (error) {
            socket.emit('customError',error)
        }
        
    }
}