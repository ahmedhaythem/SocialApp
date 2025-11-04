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
import { ApplicationException, NotFoundException } from '../../utils/Error';
import { s3DeleteFolder, uploadMultiFiles } from '../../utils/multer/s3.services';
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

        const validNewTags = (newTags || []).filter(
            (tag: string) => tag && Types.ObjectId.isValid(tag)
        )

        if (validNewTags.length) {
            const users = await this.userModel.find({
            filter: {
                _id: {
                $in: validNewTags,
                },
            },
            });

            if (users.length !== validNewTags.length) {
            throw new Error("There are some tags not found");
            }
        }
            
            
        // if(newTags.length !== req.body.tags?.length){
        //     throw new Error('There are some tags not found')
        // }
        
            if(newAttachmnets.length){
                attachmentsLink=await uploadMultiFiles({
                    files:newAttachmnets,
                    path:`$users/${userId}/posts/${post.assestsFolderId}`
                })
            }
            

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
                                        removedAttachments || []
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
                                        removedTags || []
                                    ]
                                },
                            validNewTags
                                    .filter((tag: string) => Types.ObjectId.isValid(tag)) // ✅ only valid IDs
                                    .map((tag: string) => Types.ObjectId.createFromHexString(tag))
                            ]
                        }
                    },

                }
            ])



        return successHandler({res})
    }



    freezePost = async (req: Request, res: Response): Promise<Response> => {
        const { postId } = req.params;
        const userId = res.locals.user._id;

        const post = await this.postModel.findOne({
            filter: {
                _id: postId,
                createdBy: userId,
            },
        });

        if (!post) throw new NotFoundException("Post not found");
        
        if (post.createdBy.toString() !== userId.toString()) {
            throw new ApplicationException("You are not authorized to perform this action", 403);
        }

        if (post.isFrozen) {
            throw new Error("Post is already frozen");
        }

        await post.updateOne({
            $set: {
                isFrozen: true,
                allowComments: false,
            },
        });

        return successHandler({ res, data: "Post has been frozen successfully" });
    };


    unfreezePost = async (req: Request, res: Response): Promise<Response> => {
        const { postId } = req.params;
        const userId = res.locals.user._id;

        const post = await this.postModel.findOne({
            filter: {
                _id: postId,
                createdBy: userId,
            },
        });

        if (!post) throw new NotFoundException("Post not found");

        if (post.createdBy.toString() !== userId.toString()) {
            throw new ApplicationException("You are not authorized to perform this action", 403);
        }

        if (!post.isFrozen) {
            throw new Error("Post is not frozen");
        }

        await post.updateOne({
            $set: {
                isFrozen: false,
                allowComments: true,
            },
        });

        return successHandler({ res, data: "Post has been unfrozen successfully" });
    };



    hardDeletePost = async (req: Request, res: Response): Promise<Response> => {
        const { postId } = req.params;
        const userId = res.locals.user._id;

        const post = await this.postModel.findOne({
            filter: {
                _id: postId,
                createdBy: userId,
            },
        });

        if (!post) throw new NotFoundException("Post not found");

        if (post.createdBy.toString() !== userId.toString()) {
            throw new ApplicationException("You are not authorized to perform this action", 403);
        }

        if (post.assestsFolderId) {
            try {
                await s3DeleteFolder(`users/${userId}/posts/${post.assestsFolderId}`);
            } catch (err) {
                console.warn("Failed to delete S3 folder:", err);
            }
        }

        await this.postModel.delete({
            filter: { _id: postId },
        });

        return successHandler({ res, data: "Post deleted" });
    };


    



}
