"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const bcrypt_1 = __importDefault(require("bcrypt"));
const userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    confirmed: {
        type: Boolean,
        default: false
    },
    emailOtp: {
        otp: String,
        expireIn: Date,
    },
    passwordOtp: {
        otp: String,
        expireIn: Date,
    },
    phone: {
        type: String
    },
    failedOtpAttempts: { type: Number, default: 0 },
    otpBanUntil: { type: Date, default: null },
    isCredentialsUpdated: Date,
    deleteAt: Date,
    friends: [{
            type: mongoose_1.Types.ObjectId,
            ref: 'user'
        }]
}, {
    timestamps: true,
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    },
    strictQuery: true
});
userSchema.pre("save", async function () {
    if (this.isModified("password")) {
        this.password = await bcrypt_1.default.hash(this.password, 10);
    }
});
userSchema.pre(['findOne', 'find'], function (next) {
    const query = this.getQuery();
    console.log({
        this: this,
        query: this.getQuery()
    });
    if (query.paranoId === false) {
        this.setQuery({ ...query });
    }
    else {
        this.setQuery({ ...this.getQuery(), deleteAt: { $exists: false } });
    }
    next();
});
// userSchema.pre('updateOne',function(next){
//     const update=this.getUpdate() as UpdateQuery<HydratedDocument<IUser>>
//     console.log({update});
//     if(update.deleteAt){
//         this.setUpdate({...update, isCredentialsUpdated:new Date()})
//     }
//     if(update.password){
//         const hashedpassword=createHash(update.password as string)
//         this.setUpdate({...update, password:hashedpassword, isCredentialsUpdated:new Date()})
//     }
//     next()
// })
exports.UserModel = (0, mongoose_1.model)("user", userSchema);
