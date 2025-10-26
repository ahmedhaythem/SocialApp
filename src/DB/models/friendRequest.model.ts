import mongoose, { model, Schema, Types } from "mongoose";
import { required } from "zod/v4/core/util.cjs";






export interface IFriendRequest{
    from:Types.ObjectId,
    to:Types.ObjectId

    accpetedAt:Date

    createdAt:Date
    updatedAt:Date
}


const friendRequestSchema= new Schema<IFriendRequest>({
    from:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    to:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    accpetedAt:Date
},{
    timestamps:true
})


export const FreindRequestModel=model<IFriendRequest>('friendRequest',friendRequestSchema)