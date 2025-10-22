"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPostSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const generalValidation_1 = require("../../utils/generalValidation");
exports.createPostSchema = zod_1.default.object({
    content: generalValidation_1.generalValidation.content,
    files: generalValidation_1.generalValidation.files,
    availability: generalValidation_1.generalValidation.availability,
    allowComments: generalValidation_1.generalValidation.allowComments,
    tags: generalValidation_1.generalValidation.tags,
}).superRefine((data, ctx) => {
    if (!data.content && (!data.files || data.files.length == 0)) {
        ctx.addIssue({
            code: 'custom',
            message: "Either content or attachments are required to create a post",
            path: ["content", "attachments"]
        });
    }
});
