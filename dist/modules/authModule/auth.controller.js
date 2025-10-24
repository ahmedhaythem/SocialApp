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
const auth_middleware_1 = require("./../../middleware/auth.middleware");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const auth_service_1 = require("./auth.service");
const express_1 = require("express");
const authValidation = __importStar(require("./auth.validation"));
const multer_1 = require("../../utils/multer/multer");
const router = (0, express_1.Router)();
const authServices = new auth_service_1.AuthServices();
router.post('/signup', (0, validation_middleware_1.validation)(authValidation.signupSchema), authServices.signUp);
router.post('/login', (0, validation_middleware_1.validation)(authValidation.loginSchema), authServices.login);
router.patch('/confirm-email', authServices.confirmEmail);
router.patch("/resend-otp", (0, validation_middleware_1.validation)(authValidation.resendOtp), authServices.resendOtp);
router.get("/me", (0, auth_middleware_1.auth)(), authServices.getUser);
router.post("/refresh-token", authServices.refreshToken);
router.patch("/forget-password", (0, validation_middleware_1.validation)(authValidation.forgetPasswordSchema), authServices.forgetPassword);
router.patch("/reset-password", authServices.resetPassword);
router.patch('/profile-image', (0, auth_middleware_1.auth)(), (0, multer_1.uploadFile)({}).single("image"), authServices.profileImage);
exports.default = router;
