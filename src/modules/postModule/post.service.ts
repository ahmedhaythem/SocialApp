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
import { uploadMultiFiles } from '../../utils/multer/s3.services';
import { nanoid } from 'nanoid';






interface IPostService{
    createPost(req:Request, res:Response):Promise<Response>
}



export class PostServices implements IPostService{
    private postModel=new PostRepo()
    private userModel= new UserRepo()
    createPost= async (req: Request, res: Response): Promise<Response>=> {
        
        const files:Express.Multer.File[]=req.files as Express.Multer.File[]
        const assestsFolderId = nanoid(15)
        const path= `$users/${res.locals.user._id}/posts/${assestsFolderId}`
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

        let attachments:string[]=[]
        if(files?.length){
            attachments=await uploadMultiFiles({
                files,
                path
            })
        }

        const post =await this.postModel.create({
            data:{
                ...req.body,
                attachments,
                createdBy:res.locals.user._id,
                assestsFolderId


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
            newTags:string[]
            removedTags:Types.ObjectId[]
        }=req.body
        let attachmentsLink:string[]=[]
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
            
            
            if(newTags.length !== req.body.tags?.length){
                throw new Error('There are some tags not found')
            }
        
            if(newAttachmnets.length){
                attachmentsLink=await uploadMultiFiles({
                    files:newAttachmnets,
                    path:`$users/${userId}/posts/${post.assestsFolderId}`
                })
            }

            // post.attachments?.push(...(attachmentsLink || []))

            // let attachments=post.attachments

            // if(removedAttachments?.length){
            //     attachments= post.attachments?.filter((link)=>{
            //         if(!removedAttachments.includes(link)){
            //             return link
            //         }
            // })
            // }
            // post.tags.push(...(newTags ||[]))
            // let tags=post.tags
            // if(removedTags?.length){
            //     tags=post.tags?.filter((tag)=>{
            //                 if(!removedTags.includes(tag)){
            //                         return tag
            //             }
            //     })
            // }

            // await post.updateOne({
            //     content:content || post.content,
            //     availability:availability ||post.availability,
            //     allowComments:allowComments ||post.allowComments,
            //     attachments,
            //     tags
            // })

            

            await post.updateOne([
                {
                    $set:{
                        content:content || post.content,
                        availability:availability ||post.availability,
                        allowComments:allowComments ||post.allowComments,
                        attachments:{
                            $setUnion:[
                                {
                                    $setDifference:[
                                        "$attachments",
                                        removedAttachments
                                    ]
                                },
                                attachmentsLink
                            ]
                        },
                        tags:{
                            $setUnion:[
                                {
                                    $setDifference:[
                                        "$tags",
                                        removedTags
                                    ]
                                },
                                newTags.map((tag:string)=>{
                                    return Types.ObjectId.createFromHexString(tag)
                                })
                            ]
                        }
                    },

                }
            ])



        return successHandler({res})
    }
}
