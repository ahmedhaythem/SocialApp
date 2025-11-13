import { ObjectId, Types } from 'mongoose';
import { NotFoundException } from '../../utils/Error';
import { UserRepo } from './../authModule/auth.repo';
import { Request, Response } from "express";
import { ChatRepo } from './chat.reop';
import { successHandler } from '../../utils/successHandler';





export class ChatServieces{
    private userRepo=new UserRepo()
    private chatRepo=new ChatRepo()
    constructor(){ }


    getChat=async (req:Request, res:Response)=>{
        const loggedUser=res.locals.user
        const userId=Types.ObjectId.createFromHexString(req.params.userId as string)
        const to= await this.userRepo.findOne({
            filter:{
                _id:userId,
                friends:{
                    $in:[loggedUser._id]
                }
            }
        })
        if(!to){
            throw new NotFoundException('user not found')
        }
        const chat = await this.chatRepo.findOne({
            filter:{
                participants:{
                    $all:[to._id, loggedUser._id]
                },
                group:{
                    $exists:false
                }
            },
            options:{
                populate:'participants'
            }
        })
        if(!chat){
            const newChat= await this.chatRepo.create({
                data:{
                    participants:[to._id, loggedUser._id],
                    createdBy: loggedUser._id,
                    message:[]
                }
            })
            // console.log("hahahahahahahahaah");
            
            return successHandler({res, data: newChat})
        }
        return successHandler({res,data:chat})
    }


}



