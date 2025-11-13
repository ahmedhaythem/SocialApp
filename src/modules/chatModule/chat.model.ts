import mongoose, { HydratedDocument, model, models, Schema, Types } from 'mongoose';




export interface IMessage{
    createdBy:Types.ObjectId
    content:string
    createdAt?:Date
    updatedAt?:Date
}


export type HMessageDocument =HydratedDocument<IMessage>


const messageSchema=new Schema<IMessage>({
    content:{
        type:String,
        required:true
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    }
},{
    timestamps:true
})


export interface  IChat{
    participants:Types.ObjectId[]
    message:IMessage[]

    group?:string,
    groupImage:string,
    roomId:string

    createdBy:Types.ObjectId
    createdAt:Date
    updatedAt:Date
}

export type HChatDocument=HydratedDocument<IChat>

const chatSchema=new Schema<IChat>({
    participants:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        require:true
    }],
    message:[messageSchema],
    group:String,
    groupImage:String,
    createdBy:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:"user",
        required:true
    }
},{
    timestamps:true
})


export const  ChatModel=models.chat || model<IChat>('chat',chatSchema)