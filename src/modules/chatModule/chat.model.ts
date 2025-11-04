import { Types } from 'mongoose';







export interface  IChat{
    participants:Types.ObjectId[]
    message:string[]

    group?:string,
    groupImage:string,
    roomId:string

    createdBy:Types.ObjectId
    createdAt:Date
    updatedAt:Date
}