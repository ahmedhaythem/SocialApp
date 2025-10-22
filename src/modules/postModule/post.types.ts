import { HydratedDocument, Types } from "mongoose"


export enum PostAvailabilityEnum{
    PUBLIC='public',
    PRIVATE='private',
    FRIENDS='friends'
}

export interface IPost{
    content?:string
    attachment?:string
    createdBy:Types.ObjectId
    availability:PostAvailabilityEnum
    allowComments:Boolean
    likes:Array<Types.ObjectId>
    tags:Array<Types.ObjectId>
    isDeleted?:Boolean
    assestsFolderId:string
    createdAt?:Date
    updatedAt?:Date
}

export type PostDocument=HydratedDocument<IPost>