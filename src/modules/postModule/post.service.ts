import { HydratedDocument, ObjectId, Types } from 'mongoose';
import { IUser, UserModel } from './../../DB/models/user.model';
import { PostAvailabilityEnum } from './post.types';
import { Request, Response } from "express";
import { success, superRefine } from "zod";
import { successHandler } from "../../utils/successHandler";
import { createPostDTO } from './post.DTO';
import { UserRepo } from '../authModule/auth.repo';
import { PostRepo } from './post.repo';
import { availabilityConditon } from '../../DB/models/post.model';
import { NotFoundException } from '../../utils/Error';






interface IPostService{
    createPost(req:Request, res:Response):Promise<Response>
}



export class PostServices implements IPostService{
    private postModel=new PostRepo()
    private userModel= new UserRepo()
    createPost= async (req: Request, res: Response): Promise<Response>=> {
        
        // const {allowComments, availability, content, tags}:createPostDTO=req.body
        const files=req.files || []
        if(req.body.tags?.length){
            const users =await this.userModel.find({
                filter:{
                    _id:{
                        $in: req.body.tags
                    }
                }
            })
            console.log({users:users});
            
            if(users.length !== req.body.tags?.length){
                throw new Error('there are some users not found')
            }
        }

        // let attachments=[]
        // if(files?.length){

        // }

        const post =await this.postModel.create({
            data:{
                ...req.body,
                // attachments,
                createdBy:res.locals.user._id,
                // assestsFolderId


        }})
        
        return successHandler({res, data:post})
    }


    likePost= async (req:Request, res:Response):Promise<Response>=> {
        const{postId, likeType}:{
            postId:Types.ObjectId,
            likeType:'like'| 'unlike'
        }=req.body
        const user:HydratedDocument<IUser> =res.locals.user
        const post = await this.postModel.findOne({
            filter:{
                _id:postId,
                $or:availabilityConditon(user)
            }
        })

        if(!post){
            throw new NotFoundException()
        }


        if(likeType=="like"){
            await post?.updateOne({
                $addToSet:{
                    likes:user._id
                }
            })
        }else{
            await post?.updateOne({
                $pull:{
                    likes:user._id
                }
            })
        }
        await post.save()

        return successHandler({res, data:post})
    }

    updatePost= async (req:Request, res:Response)=>{
        const postId=req.params.id as string
        const userId=res.locals.user._id
        const {
            content,
            availability,
            allowComments,
            removedAttachments,
            newTags,
            removedTags
        }:{
            content?:string,
            availability:PostAvailabilityEnum,
            allowComments:boolean,
            removedAttachments:Array<string>,
            newTags:Types.ObjectId[]
            removedTags:Types.ObjectId[]
        }=req.body
        let attachments:string[]=[]
        const newAttachmnets=(req.files as Array<Express.Multer.File>)

        const post =await this.postModel.findOne({filter:{
            _id:postId,
            createdBy:userId
        }})
        if(!post){
            throw new NotFoundException('Post not found')
        }
        const users =await this.userModel.find({
                filter:{
                    _id:{
                        $in: newTags
                    }
                }
            })
            console.log({users:users});
            
            if(newTags.length !== req.body.tags?.length){
                throw new Error('There are some tags not found')
            }
        
            if(newAttachmnets.length){
                // attachments=await uploadMulifiles({
                //     files:newAttachmnets
                // })
            }

            await post.updateOne({
                content:content || post.content,
                availability:availability ||post.availability,
                allowComments:allowComments ||post.allowComments,
                $addToSet:{
                    attachments:{ $each:attachments },
                    tags:{$each:newTags}
                },
                $pull:{
                    attachments:{ $each:removedAttachments },
                    tags:{$each:removedTags}
                }
            })








        return successHandler({res})
    }
}
