import { model, Schema } from "mongoose"
import bcrypt from "bcrypt";

export interface IUser{
    name:string,
    email:string,
    password:string,
    confirmed:boolean,
    emailOtp:{
        otp:string,
        expireIn:Date
    },
    phone:string,
    failedOtpAttempts: number,
    otpBanUntil: Date | null,
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
    phone: {
        type:String
    },
    failedOtpAttempts: { type: Number, default: 0 },
    otpBanUntil: { type: Date , default: null },
},{
    timestamps:true,
    toJSON:{
        virtuals:true
    },
    toObject:{
        virtuals:true
    }
})

userSchema.pre("save", async function () {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
});

export const userModel=model<IUser>("user",userSchema)