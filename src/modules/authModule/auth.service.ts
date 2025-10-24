import { email } from 'zod';
import { forgetPasswordSchema } from './auth.validation';
import { IUser, UserModel } from './../../DB/models/user.model';
import { NextFunction,Request,Response } from "express";
import { ApplicationException, InvalidOTPException, NotConfirmedException, NotFoundException, NotValidEmail, ValidationError } from "../../utils/Error";
import bcrypt, { compare,hash } from "bcrypt";
import { createOtp, emailEmitter } from '../../utils/sendEmail/emailEvent';
import { UserRepo } from './auth.repo';
import { forgetPasswordDTO, loginDTO, resendOtpDTO } from './auth.DTO';
import { successHandler } from '../../utils/successHandler';
import { createJwt } from '../../utils/jwt';
import { nanoid } from 'nanoid';
import { decodeToken, IRequest, TokenTypesEnum } from '../../middleware/auth.middleware';
import { createHash } from 'crypto';
import {  uploadSingleFile } from '../../utils/multer/s3.services';
import { HydratedDocument } from 'mongoose';
interface IAuthServices{
    signUp(req:Request,res:Response,next:NextFunction): Promise<Response>,
    login(req:Request,res:Response,next:NextFunction): Promise<Response>,
    confirmEmail(req:Request,res:Response,next:NextFunction): Promise<Response>,
    resendOtp(req:Request,res:Response,next:NextFunction): Promise<Response>,
}



export class AuthServices implements IAuthServices{
    private userModel=new UserRepo()

    constructor(){}
    signUp=async (req:Request,res:Response,next:NextFunction): Promise<Response>=>{
        const {name,email,password,phone}=req.body
        const existing=await this.userModel.findByEmail({email})

        if(existing){
            throw new NotValidEmail()
        }


        const otp=createOtp()
        const hashedOtp = await hash(otp, 10);        
            const newUser=await this.userModel.create({
                data:{
                    name,
                    email,
                    password,
                    phone,
                    emailOtp:{
                        otp:hashedOtp,
                        expireIn:new Date(Date.now()+ 2 * 60 * 1000)
                    } 
                }
            })

        await newUser.save()
        emailEmitter.emit('sendPasswrodOTP',{email:newUser.email,otp,userName:newUser.name})
        return res.status(201).json({ message: "User created" });

    }



    async login(req: Request, res: Response, next: NextFunction): Promise<Response> {
        const {email,password}:loginDTO=req.body
        const user= await UserModel.findOne({email})

        if(!email || !password){
            return res.status(404).json({error:"email amd password are required"})
        }

        if (!user || !(await bcrypt.compare(password, user.password))){
            return res.status(400).json({ error: "Invalid email or password" });
        }

        if(!user.confirmed){
            return res.status(400).json({error:"email not confirmed"})
        }

        
        const jti=nanoid()
        const accessToken:string=createJwt({
            id:user._id,

        },
        process.env.ACCESS_SIGNATURE as string,
        {
            jwtid:jti,
            expiresIn: "1H"
        }
    )


        const refreshToken:string=createJwt({
            jwtid:jti,
            id:user._id,

        },
        process.env.REFRESH_SIGNATURE as string,
        {
            expiresIn: "7 D"
        }
    )

        return res.status(200).json({msg:"Login successfully",accessToken:accessToken,refreshToken:refreshToken})
    }



    async confirmEmail(req:Request,res:Response,next:NextFunction): Promise<Response> {
        const {email,otp}=req.body

        if(!email||!otp){
            return res.status(400).json({error:"email and OTP are required "})
        }

        const user =await UserModel.findOne({email})

        if (!user) {
            return res.status(404).json({error:"User not found"})
        }


        if (user.otpBanUntil && user.otpBanUntil.getTime() > Date.now()) {
            const remaining = Math.ceil((user.otpBanUntil.getTime() - Date.now()) / 1000);
            return res.status(403).json({
                error: `Too many failed attempts. Try again in ${remaining} seconds.`,
            });
        }

        if(user.emailOtp.expireIn.getTime() <= Date.now()){
            return res.status(500).json({error:"otp expired...please reconfirm your email"})
        }


        const isMatch=await bcrypt.compare(otp,user.emailOtp.otp)
        if (!isMatch) {
            user.failedOtpAttempts += 1;

            if (user.failedOtpAttempts >= 5) {
            user.otpBanUntil = new Date(Date.now() + 5 * 60 * 1000);
            await user.save();
            return res.status(403).json({ error: "Too many failed attempts. Banned for 5 minutes." });
            }

            await user.save();
            return res.status(400).json({ error: "Invalid OTP" });
        }


        

        user.emailOtp = { otp: "", expireIn: new Date(0) };
        user.confirmed=true
        user.failedOtpAttempts = 0;
        user.otpBanUntil = null;
        await user.save()
        return res.status(200).json({message:"Email verified successfully"})
}


    resendOtp=async (req:Request, res:Response,next:NextFunction) :Promise<Response>=>{
        const {email}:resendOtpDTO=req.body
        const user=await this.userModel.findByEmail({email})
        if(!user){
            throw new NotFoundException("user not found")
        }

        if(user.confirmed){
            throw new ApplicationException("you are already confirmed",409)
        }

        if(user.email && user.emailOtp.expireIn.getTime()>Date.now()){
            throw new ApplicationException('old otp expierd, wait five minutes',400)
        }


        const otp=createOtp()
        const hashedOtp = await hash(otp, 10);
        emailEmitter.emit('confirmEmail',{email:user.email,otp,userName:user.name})
        user.emailOtp={
            expireIn:new Date(Date.now()+5*60*100),
            otp:hashedOtp
        }
        user.save()
        return successHandler({res,data:user})
        
    }


    refreshToken=async(req:Request, res:Response)=>{
        const authorization=req.headers.authorization
        const {user,payload} =await decodeToken({authorization,tokenTypes:TokenTypesEnum.referesh})
        
        
        const accessToken:string=createJwt({
            id:user._id,

        },
        process.env.ACCESS_SIGNATURE as string,
        {
            jwtid:String(payload.jti),
            expiresIn: "1H"
        }
    )
    
    
    return successHandler({res,
            data:{
                accessToken
            }
        })
    }



    getUser=async(req: Request, res: Response, next: NextFunction): Promise <Response> => {
        
        const user:IUser=res.locals.user
        return successHandler({res,data:user})
    }

    forgetPassword=async(req: Request, res: Response, next: NextFunction): Promise <Response> => {
        const {email}:forgetPasswordDTO=req.body
        const user=await this.userModel.findByEmail({email})
        
        if(!user){
            throw new NotFoundException("user not found")
        }

        if(!user.confirmed){
            throw new NotConfirmedException()
        }

        const otp=createOtp()
        const hashedOtp = await hash(otp, 10);
        emailEmitter.emit('sendPasswrodOTP',{email:user.email,otp,userName:user.name})

        user.passwordOtp={
            otp:hashedOtp,
            expireIn:new Date(Date.now()+5*60*1000)
        }
        await user.save()
        return successHandler({res})

    }

    resetPassword=async (req: Request, res: Response, next: NextFunction): Promise <Response> => {
        const {email,otp,password}=req.body
        const user=await this.userModel.findByEmail({email})

        if(!user){
            throw new NotConfirmedException("user not found")
        }

        if(!user.passwordOtp?.otp){
            throw new ApplicationException("user forget password first",409)
        }

        if(user.passwordOtp?.expireIn.getTime()<=Date.now()){
            throw new ApplicationException('old otp expierd, wait five minutes',400)
        }

        const isMatch = await compare(otp, user.passwordOtp.otp);
        if(!isMatch){
            throw new InvalidOTPException()
        }
        
        await user.updateOne({
            password:await bcrypt.hash(password, 10),
            isCredentialsUpdated:new Date(Date.now()),
            $unset:{
                passwordOtp:""
            }
        })
        return successHandler({res})
    }



    profileImage= async(req:Request,res:Response)=>{
        const user=res.locals.user as HydratedDocument<IUser>
        const path=await uploadSingleFile({
            file:req.file as Express.Multer.File
        })
        user.profileImage=path
        await user.save()
        successHandler({res,data:path})
    }



}
