import z from "zod"
import { PostAvailabilityEnum } from "./post.types"
import { generalValidation } from "../../utils/generalValidation"

export const createPostSchema=z.object({
    content:generalValidation.content,
    files:generalValidation.files,
    availability:generalValidation.availability,
    allowComments:generalValidation.allowComments,
    tags:generalValidation.tags,
}).superRefine((data,ctx)=>{
    if(!data.content && (!data.files || data.files.length==0)){
        ctx.addIssue({
            code:'custom',
            message:"Either content or attachments are required to create a post",
            path:["content","attachments"]
        })
    }
})