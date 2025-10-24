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
exports.AuthServices = void 0;
const user_model_1 = require("./../../DB/models/user.model");
const Error_1 = require("../../utils/Error");
const bcrypt_1 = __importStar(require("bcrypt"));
const emailEvent_1 = require("../../utils/sendEmail/emailEvent");
const auth_repo_1 = require("./auth.repo");
const successHandler_1 = require("../../utils/successHandler");
const jwt_1 = require("../../utils/jwt");
const nanoid_1 = require("nanoid");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const s3_services_1 = require("../../utils/multer/s3.services");
class AuthServices {
    userModel = new auth_repo_1.UserRepo();
    constructor() { }
    signUp = async (req, res, next) => {
        const { name, email, password, phone } = req.body;
        const existing = await this.userModel.findByEmail({ email });
        if (existing) {
            throw new Error_1.NotValidEmail();
        }
        const otp = (0, emailEvent_1.createOtp)();
        const hashedOtp = await (0, bcrypt_1.hash)(otp, 10);
        const newUser = await this.userModel.create({
            data: {
                name,
                email,
                password,
                phone,
                emailOtp: {
                    otp: hashedOtp,
                    expireIn: new Date(Date.now() + 2 * 60 * 1000)
                }
            }
        });
        await newUser.save();
        emailEvent_1.emailEmitter.emit('sendPasswrodOTP', { email: newUser.email, otp, userName: newUser.name });
        return res.status(201).json({ message: "User created" });
    };
    async login(req, res, next) {
        const { email, password } = req.body;
        const user = await user_model_1.UserModel.findOne({ email });
        if (!email || !password) {
            return res.status(404).json({ error: "email amd password are required" });
        }
        if (!user || !(await bcrypt_1.default.compare(password, user.password))) {
            return res.status(400).json({ error: "Invalid email or password" });
        }
        if (!user.confirmed) {
            return res.status(400).json({ error: "email not confirmed" });
        }
        const jti = (0, nanoid_1.nanoid)();
        const accessToken = (0, jwt_1.createJwt)({
            id: user._id,
        }, process.env.ACCESS_SIGNATURE, {
            jwtid: jti,
            expiresIn: "1H"
        });
        const refreshToken = (0, jwt_1.createJwt)({
            jwtid: jti,
            id: user._id,
        }, process.env.REFRESH_SIGNATURE, {
            expiresIn: "7 D"
        });
        return res.status(200).json({ msg: "Login successfully", accessToken: accessToken, refreshToken: refreshToken });
    }
    async confirmEmail(req, res, next) {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ error: "email and OTP are required " });
        }
        const user = await user_model_1.UserModel.findOne({ email });
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
    resendOtp = async (req, res, next) => {
        const { email } = req.body;
        const user = await this.userModel.findByEmail({ email });
        if (!user) {
            throw new Error_1.NotFoundException("user not found");
        }
        if (user.confirmed) {
            throw new Error_1.ApplicationException("you are already confirmed", 409);
        }
        if (user.email && user.emailOtp.expireIn.getTime() > Date.now()) {
            throw new Error_1.ApplicationException('old otp expierd, wait five minutes', 400);
        }
        const otp = (0, emailEvent_1.createOtp)();
        const hashedOtp = await (0, bcrypt_1.hash)(otp, 10);
        emailEvent_1.emailEmitter.emit('confirmEmail', { email: user.email, otp, userName: user.name });
        user.emailOtp = {
            expireIn: new Date(Date.now() + 5 * 60 * 100),
            otp: hashedOtp
        };
        user.save();
        return (0, successHandler_1.successHandler)({ res, data: user });
    };
    refreshToken = async (req, res) => {
        const authorization = req.headers.authorization;
        const { user, payload } = await (0, auth_middleware_1.decodeToken)({ authorization, tokenTypes: auth_middleware_1.TokenTypesEnum.referesh });
        const accessToken = (0, jwt_1.createJwt)({
            id: user._id,
        }, process.env.ACCESS_SIGNATURE, {
            jwtid: String(payload.jti),
            expiresIn: "1H"
        });
        return (0, successHandler_1.successHandler)({ res,
            data: {
                accessToken
            }
        });
    };
    getUser = async (req, res, next) => {
        const user = res.locals.user;
        return (0, successHandler_1.successHandler)({ res, data: user });
    };
    forgetPassword = async (req, res, next) => {
        const { email } = req.body;
        const user = await this.userModel.findByEmail({ email });
        if (!user) {
            throw new Error_1.NotFoundException("user not found");
        }
        if (!user.confirmed) {
            throw new Error_1.NotConfirmedException();
        }
        const otp = (0, emailEvent_1.createOtp)();
        const hashedOtp = await (0, bcrypt_1.hash)(otp, 10);
        emailEvent_1.emailEmitter.emit('sendPasswrodOTP', { email: user.email, otp, userName: user.name });
        user.passwordOtp = {
            otp: hashedOtp,
            expireIn: new Date(Date.now() + 5 * 60 * 1000)
        };
        await user.save();
        return (0, successHandler_1.successHandler)({ res });
    };
    resetPassword = async (req, res, next) => {
        const { email, otp, password } = req.body;
        const user = await this.userModel.findByEmail({ email });
        if (!user) {
            throw new Error_1.NotConfirmedException("user not found");
        }
        if (!user.passwordOtp?.otp) {
            throw new Error_1.ApplicationException("user forget password first", 409);
        }
        if (user.passwordOtp?.expireIn.getTime() <= Date.now()) {
            throw new Error_1.ApplicationException('old otp expierd, wait five minutes', 400);
        }
        const isMatch = await (0, bcrypt_1.compare)(otp, user.passwordOtp.otp);
        if (!isMatch) {
            throw new Error_1.InvalidOTPException();
        }
        await user.updateOne({
            password: await bcrypt_1.default.hash(password, 10),
            isCredentialsUpdated: new Date(Date.now()),
            $unset: {
                passwordOtp: ""
            }
        });
        return (0, successHandler_1.successHandler)({ res });
    };
    profileImage = async (req, res) => {
        const user = res.locals.user;
        const path = await (0, s3_services_1.uploadSingleFile)({
            file: req.file
        });
        user.profileImage = path;
        await user.save();
        (0, successHandler_1.successHandler)({ res, data: path });
    };
}
exports.AuthServices = AuthServices;
