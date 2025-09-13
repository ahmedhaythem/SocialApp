import { parse } from './../../../node_modules/zod/src/v4/core/parse';
import { NextFunction,Request,Response } from "express";
import { ApplicationException, ValidationError } from "../../utils/Error";
import{signupSchema} from "../userModule/user.validation"
import { userModel } from '../../DB/models/user.model';
import bcrypt, { hash } from "bcrypt";
import { createOtp, emailEmitter } from '../../utils/sendEmail/emailEvent';


interface IUserServices{
    signUp(req:Request,res:Response,next:NextFunction): Promise<Response>,
    login(req:Request,res:Response,next:NextFunction): Promise<Response>,
    confirmEmail(req:Request,res:Response,next:NextFunction): Promise<Response>,
}



export class UserServices implements IUserServices{
    constructor(){}
    async signUp(req:Request,res:Response,next:NextFunction): Promise<Response>{
        const {name,email,password,phone}=req.body
        const existing=await userModel.findOne({email})

        if(existing){
            return res.status(400).json({error: "email already exits"})
        }


        const otp=createOtp()
        const hashedOtp = await hash(otp, 10);
        const newUser=new userModel({
            name,
            email,
            password,
            phone,
            emailOtp:{
            otp:hashedOtp,
            expireIn:Date.now()+ 2 * 60 * 1000
    } 
        })

        await newUser.save()
        emailEmitter.emit('confirmEmail',{email:newUser.email,otp,userName:newUser.name})
        return res.status(201).json({ message: "User created" });

    }



    async login(req: Request, res: Response, next: NextFunction): Promise<Response> {
        const {email,password}=req.body
        const user= await userModel.findOne({email})

        if(!email || !password){
            return res.status(404).json({error:"email amd password are required"})
        }

        if (!user || !(await bcrypt.compare(password, user.password))){
            return res.status(400).json({ error: "Invalid email or password" });
        }

        if(!user.confirmed){
            return res.status(400).json({error:"email not confirmed"})
        }
        return res.status(200).json({msg:"Login successfully"})
    }



    async confirmEmail(req:Request,res:Response,next:NextFunction): Promise<Response> {
        const {email,otp}=req.body

        if(!email||!otp){
            return res.status(400).json({error:"email and OTP are required "})
        }

        const user =await userModel.findOne({email})

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


}
