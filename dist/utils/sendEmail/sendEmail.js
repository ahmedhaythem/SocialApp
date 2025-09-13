"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
require("dotenv/config");
const sendEmail = async ({ to, subject, html }) => {
    console.log(process.env.EmailUser);
    console.log(process.env.EmailPass);
    const transporter = nodemailer_1.default.createTransport({
        host: process.env.EmailHOST,
        port: process.env.EmailPort,
        secure: true,
        service: "gmail",
        auth: {
            user: process.env.EmailUser,
            pass: process.env.EmailPass
        }
    });
    const main = async () => {
        const info = await transporter.sendMail({
            from: `sarahaApp "<${process.env.EmailUser}>"`,
            to,
            subject,
            html
        });
        console.log({ info });
    };
    main().catch((err) => {
        console.log(err);
    });
};
exports.sendEmail = sendEmail;
