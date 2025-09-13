"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOtp = exports.emailEmitter = void 0;
const events_1 = require("events");
const sendEmail_1 = require("./sendEmail");
const generatedHTML_1 = require("../../utils/sendEmail/generatedHTML");
const nanoid_1 = require("nanoid");
exports.emailEmitter = new events_1.EventEmitter();
const createOtp = () => {
    const otp = (0, nanoid_1.customAlphabet)('0123456789', 6)();
    return otp;
};
exports.createOtp = createOtp;
exports.emailEmitter.on('confirmEmail', async ({ email, userName, otp }) => {
    console.log("email sending...");
    const subject = "Confrim email";
    const html = (0, generatedHTML_1.template)(otp, userName, subject);
    await (0, sendEmail_1.sendEmail)({
        to: email,
        html,
        subject
    });
    console.log("email sent");
});
