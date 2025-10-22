"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalValidation = void 0;
const zod_1 = __importDefault(require("zod"));
const post_types_1 = require("../modules/postModule/post.types");
exports.generalValidation = {
    content: zod_1.default.string().optional(),
    files: zod_1.default.array(zod_1.default.any()).optional(),
    availability: zod_1.default.enum([
        post_types_1.PostAvailabilityEnum.PUBLIC,
        post_types_1.PostAvailabilityEnum.PRIVATE,
        post_types_1.PostAvailabilityEnum.FRIENDS
    ]).default(post_types_1.PostAvailabilityEnum.PUBLIC).optional(),
    allowComments: zod_1.default.boolean().default(true).optional(),
    tags: zod_1.default.array(zod_1.default.string()).optional(),
};
