import mongoose, { HydratedDocument, model, Schema, Types } from "mongoose";
import { IPost, PostAvailabilityEnum } from "../../modules/postModule/post.types";
import { IUser } from "./user.model";



export const availabilityConditon=(user:HydratedDocument<IUser>)=>{
    return[
        {
                        availability:PostAvailabilityEnum.PUBLIC
                    },
                    {
                        availability:PostAvailabilityEnum.PRIVATE,
                        createdBy:user._id
                    },
                    {
                        availability:PostAvailabilityEnum.FRIENDS,
                        createdBy:{
                            $in:[...user.friends, user._id]
                        }
                    },
                    {
                        availability:PostAvailabilityEnum.PRIVATE,
                        tags:{$in:user._id}
                    }
    ]
}



const postSchema= new Schema<IPost>({
    content:{type:String},
    attachments:[{
        type:String
    }],
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    availability:{
        type:String,
        enum:[PostAvailabilityEnum.PUBLIC,PostAvailabilityEnum.PRIVATE,PostAvailabilityEnum.FRIENDS],
        default:PostAvailabilityEnum.PUBLIC
    },
    allowComments:{
        type:Boolean,
        default:true
    },
    likes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true
    }],
    tags:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true
    }],
    isDeleted:{
        type:Boolean,
        default:false
    },
    assestsFolderId:{type:String}
},{
    timestamps:true
})


export const PostModel= model<IPost>('post',postSchema)