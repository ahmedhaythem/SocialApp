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
exports.PostModel = exports.availabilityConditon = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const post_types_1 = require("../../modules/postModule/post.types");
const availabilityConditon = (user) => {
    return [
        {
            availability: post_types_1.PostAvailabilityEnum.PUBLIC
        },
        {
            availability: post_types_1.PostAvailabilityEnum.PRIVATE,
            createdBy: user._id
        },
        {
            availability: post_types_1.PostAvailabilityEnum.FRIENDS,
            createdBy: {
                $in: [...user.friends, user._id]
            }
        },
        {
            availability: post_types_1.PostAvailabilityEnum.PRIVATE,
            tags: { $in: user._id }
        }
    ];
};
exports.availabilityConditon = availabilityConditon;
const postSchema = new mongoose_1.Schema({
    content: { type: String },
    attachments: [{
            type: String
        }],
    createdBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    availability: {
        type: String,
        enum: [post_types_1.PostAvailabilityEnum.PUBLIC, post_types_1.PostAvailabilityEnum.PRIVATE, post_types_1.PostAvailabilityEnum.FRIENDS],
        default: post_types_1.PostAvailabilityEnum.PUBLIC
    },
    allowComments: {
        type: Boolean,
        default: true
    },
    likes: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'user',
            required: true
        }],
    tags: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'user',
            required: true
        }],
    isDeleted: {
        type: Boolean,
        default: false
    },
    assestsFolderId: { type: String }
}, {
    timestamps: true
});
exports.PostModel = (0, mongoose_1.model)('post', postSchema);
