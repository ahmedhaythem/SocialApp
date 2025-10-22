import mongoose, { model, Schema, Types } from "mongoose";
import { IPost, PostAvailabilityEnum } from "../../modules/postModule/post.types";




const postSchema= new Schema<IPost>({
    content:{type:String},
    attachment:[{
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
        types:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true
    }],
    tags:[{
        types:mongoose.Schema.Types.ObjectId,
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