"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserServices = void 0;
const user_model_1 = require("../../DB/models/user.model");
const bcrypt_1 = __importStar(require("bcrypt"));
const emailEvent_1 = require("../../utils/sendEmail/emailEvent");
class UserServices {
    constructor() { }
    async signUp(req, res, next) {
        const { name, email, password, phone } = req.body;
        const existing = await user_model_1.userModel.findOne({ email });
        if (existing) {
            return res.status(400).json({ error: "email already exits" });
        }
        const otp = (0, emailEvent_1.createOtp)();
        const hashedOtp = await (0, bcrypt_1.hash)(otp, 10);
        const newUser = new user_model_1.userModel({
            name,
            email,
            password,
            phone,
            emailOtp: {
                otp: hashedOtp,
                expireIn: Date.now() + 2 * 60 * 1000
            }
        });
        await newUser.save();
        emailEvent_1.emailEmitter.emit('confirmEmail', { email: newUser.email, otp, userName: newUser.name });
        return res.status(201).json({ message: "User created" });
    }
    async login(req, res, next) {
        const { email, password } = req.body;
        const user = await user_model_1.userModel.findOne({ email });
        if (!email || !password) {
            return res.status(404).json({ error: "email amd password are required" });
        }
        if (!user || !(await bcrypt_1.default.compare(password, user.password))) {
            return res.status(400).json({ error: "Invalid email or password" });
        }
        if (!user.confirmed) {
            return res.status(400).json({ error: "email not confirmed" });
        }
        return res.status(200).json({ msg: "Login successfully" });
    }
    async confirmEmail(req, res, next) {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ error: "email and OTP are required " });
        }
        const user = await user_model_1.userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        if (user.otpBanUntil && user.otpBanUntil.getTime() > Date.now()) {
            const remaining = Math.ceil((user.otpBanUntil.getTime() - Date.now()) / 1000);
            return res.status(403).json({
                error: `Too many failed attempts. Try again in ${remaining} seconds.`,
            });
        }
        if (user.emailOtp.expireIn.getTime() <= Date.now()) {
            return res.status(500).json({ error: "otp expired...please reconfirm your email" });
        }
        const isMatch = await bcrypt_1.default.compare(otp, user.emailOtp.otp);
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
        user.confirmed = true;
        user.failedOtpAttempts = 0;
        user.otpBanUntil = null;
        await user.save();
        return res.status(200).json({ message: "Email verified successfully" });
    }
}
exports.UserServices = UserServices;
