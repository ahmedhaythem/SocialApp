"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userModel = void 0;
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
    phone: {
        type: String
    },
    failedOtpAttempts: { type: Number, default: 0 },
    otpBanUntil: { type: Date, default: null },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
});
userSchema.pre("save", async function () {
    if (this.isModified("password")) {
        this.password = await bcrypt_1.default.hash(this.password, 10);
    }
});
exports.userModel = (0, mongoose_1.model)("user", userSchema);
