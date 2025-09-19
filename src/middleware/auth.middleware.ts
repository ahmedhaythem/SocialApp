import { HydratedDocument, ObjectId } from "mongoose"
import { IUser, UserModel } from "../DB/models/user.model"
import { UserRepo } from "../modules/authModule/auth.repo"
import { ApplicationException, InvalidTokenException, NotConfirmedException, NotFoundException } from "../utils/Error"
import { verifyJWT } from "../utils/jwt"
import { NumberSchema } from "zod/v4/core/json-schema.cjs"
import { json } from "zod"
import { NextFunction, Request, Response } from "express"


export interface IRequest extends Request{
    user:Partial <IUser>
}

export enum TokenTypesEnum{
    access="access",
    referesh="refresh"
}

export interface Payload{
    id:string,
    iat:number,
    exp:number,
    jti:string
}

const userModel=new UserRepo(UserModel)
export const decodeToken= async({authorization, tokenTypes=TokenTypesEnum.access}:{authorization?:string | undefined, tokenTypes?:TokenTypesEnum}): Promise <{user:HydratedDocument<IUser>,payload:Payload}>=>{
    if(!authorization){
        throw new InvalidTokenException()
    }

    if(authorization.startsWith(process.env.BEARER_KEY as string)){
        throw new InvalidTokenException()
    }

    const token =authorization.split(' ')[1]
    if(!token){
        throw new InvalidTokenException()

    }
    const payload=verifyJWT({
        token,
        secret:tokenTypes==TokenTypesEnum.access?
            process.env.ACCESS_SIGNATURE as string:
            process.env.REFRESH_SIGNATURE as string
    })

    const user=await userModel.findById({id:payload.id})
    if(!user){
        throw new NotFoundException("user not found")
    }

    if(!user.confirmed){
        throw new NotConfirmedException()
    }

    if(user.isCredentialsUpdated.getTime()>=payload.iat*1000){
        throw new ApplicationException('please login again',409)
    }

    return {user,payload}


}

export const auth=()=>{
    return async (req:Request, res:Response,next:NextFunction)=>{
        const {user,payload}=await decodeToken({authorization:req.headers.authorization})
        res.locals.user=user
        res.locals.payload=payload
        next()
    }
}