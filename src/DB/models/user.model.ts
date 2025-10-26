import {  HydratedDocument, model, Schema, Types, UpdateQuery } from "mongoose"
import bcrypt from "bcrypt";
import { createHash } from "crypto";

type OtpType={
    otp:string,
    expireIn:Date
}

export interface IUser{
    name:string,
    email:string,
    password:string,
    confirmed:boolean,
    emailOtp:OtpType,
    passwordOtp?:OtpType,
    phone:string,
    failedOtpAttempts: number,
    otpBanUntil: Date | null,
    isCredentialsUpdated:Date,
    profileImage:string,
    coverImage:string[],
    deleteAt:Date,
    friends:[Types.ObjectId]
}

const userSchema=new Schema<IUser>({
    name: {
        type:String,
        required:true
    },
    email: {
        type:String,
        unique:true
    },
    password: {
        type:String,
        required:true
    },
    confirmed:{
        type:Boolean,
        default:false
    },
    emailOtp: {
        otp: String,
        expireIn: Date,
    },
    passwordOtp:{
        otp: String,
        expireIn: Date,
    },

    phone: {
        type:String
    },
    failedOtpAttempts: { type: Number, default: 0 },
    otpBanUntil: { type: Date , default: null },
    isCredentialsUpdated: Date,
    profileImage:String,
    coverImage:[{
        type:String
    }],
    deleteAt:Date,
    friends:[{
        type:Types.ObjectId,
        ref:'user'
    }]
},{
    timestamps:true,
    toJSON:{
        virtuals:true
    },
    toObject:{
        virtuals:true
    },
    strictQuery:true
})

userSchema.pre("save", async function () {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
});

userSchema.pre(['findOne','find'],function(next){
    const query=this.getQuery()
    console.log({
        this:this,
        query:this.getQuery()
    });
    if(query.paranoId===false){
        this.setQuery({...query})
    }else{
        this.setQuery({...this.getQuery(), deleteAt:{$exists:false}})
    }

    
    next()
    
})

userSchema.pre('updateOne',function(next){
    const update=this.getUpdate() as UpdateQuery<HydratedDocument<IUser>>
    console.log({update});
    if(update.deleteAt){
        this.setUpdate({...update, isCredentialsUpdated:new Date()})
    }

    if(update.password){
        const hashedpassword=createHash(update.password as string)
        this.setUpdate({...update, password:hashedpassword, isCredentialsUpdated:new Date()})
    }
    next()
})

export const UserModel=model<IUser>("user",userSchema)