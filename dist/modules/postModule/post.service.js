"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostServices = void 0;
const mongoose_1 = require("mongoose");
const successHandler_1 = require("../../utils/successHandler");
const auth_repo_1 = require("../authModule/auth.repo");
const post_repo_1 = require("./post.repo");
const post_model_1 = require("../../DB/models/post.model");
const Error_1 = require("../../utils/Error");
const s3_services_1 = require("../../utils/multer/s3.services");
const nanoid_1 = require("nanoid");
class PostServices {
    postModel = new post_repo_1.PostRepo();
    userModel = new auth_repo_1.UserRepo();
    createPost = async (req, res) => {
        const files = req.files;
        const assestsFolderId = (0, nanoid_1.nanoid)(15);
        const path = `$users/${res.locals.user._id}/posts/${assestsFolderId}`;
        if (req.body.tags?.length) {
            const users = await this.userModel.find({
                filter: {
                    _id: {
                        $in: req.body.tags
                    }
                }
            });
            console.log({ users: users });
            if (users.length !== req.body.tags?.length) {
                throw new Error('there are some users not found');
            }
        }
        let attachments = [];
        if (files?.length) {
            attachments = await (0, s3_services_1.uploadMultiFiles)({
                files,
                path
            });
        }
        const post = await this.postModel.create({
            data: {
                ...req.body,
                attachments,
                createdBy: res.locals.user._id,
                assestsFolderId
            }
        });
        return (0, successHandler_1.successHandler)({ res, data: post });
    };
    likePost = async (req, res) => {
        const { postId, likeType } = req.body;
        const user = res.locals.user;
        const post = await this.postModel.findOne({
            filter: {
                _id: postId,
                $or: (0, post_model_1.availabilityConditon)(user)
            }
        });
        if (!post) {
            throw new Error_1.NotFoundException();
        }
        if (likeType == "like") {
            await post?.updateOne({
                $addToSet: {
                    likes: user._id
                }
            });
        }
        else {
            await post?.updateOne({
                $pull: {
                    likes: user._id
                }
            });
        }
        await post.save();
        return (0, successHandler_1.successHandler)({ res, data: post });
    };
    updatePost = async (req, res) => {
        const postId = req.params.id;
        const userId = res.locals.user._id;
        const { content, availability, allowComments, removedAttachments, newTags, removedTags } = req.body;
        let attachmentsLink = [];
        const newAttachmnets = req.files;
        const post = await this.postModel.findOne({ filter: {
                _id: postId,
                createdBy: userId
            } });
        if (!post) {
            throw new Error_1.NotFoundException('Post not found');
        }
        const validNewTags = (newTags || []).filter((tag) => tag && mongoose_1.Types.ObjectId.isValid(tag));
        if (validNewTags.length) {
            const users = await this.userModel.find({
                filter: {
                    _id: {
                        $in: validNewTags,
                    },
                },
            });
            if (users.length !== validNewTags.length) {
                throw new Error("There are some tags not found");
            }
        }
        // if(newTags.length !== req.body.tags?.length){
        //     throw new Error('There are some tags not found')
        // }
        if (newAttachmnets.length) {
            attachmentsLink = await (0, s3_services_1.uploadMultiFiles)({
                files: newAttachmnets,
                path: `$users/${userId}/posts/${post.assestsFolderId}`
            });
        }
        await post.updateOne([
            {
                $set: {
                    content: content || post.content,
                    availability: availability || post.availability,
                    allowComments: allowComments || post.allowComments,
                    attachments: {
                        $setUnion: [
                            {
                                $setDifference: [
                                    "$attachments",
                                    removedAttachments || []
                                ]
                            },
                            attachmentsLink
                        ]
                    },
                    tags: {
                        $setUnion: [
                            {
                                $setDifference: [
                                    "$tags",
                                    removedTags || []
                                ]
                            },
                            validNewTags
                                .filter((tag) => mongoose_1.Types.ObjectId.isValid(tag)) // ✅ only valid IDs
                                .map((tag) => mongoose_1.Types.ObjectId.createFromHexString(tag))
                        ]
                    }
                },
            }
        ]);
        return (0, successHandler_1.successHandler)({ res });
    };
    freezePost = async (req, res) => {
        const { postId } = req.params;
        const userId = res.locals.user._id;
        const post = await this.postModel.findOne({
            filter: {
                _id: postId,
                createdBy: userId,
            },
        });
        if (!post)
            throw new Error_1.NotFoundException("Post not found");
        if (post.createdBy.toString() !== userId.toString()) {
            throw new Error_1.ApplicationException("You are not authorized to perform this action", 403);
        }
        if (post.isFrozen) {
            throw new Error("Post is already frozen");
        }
        await post.updateOne({
            $set: {
                isFrozen: true,
                allowComments: false,
            },
        });
        return (0, successHandler_1.successHandler)({ res, data: "Post has been frozen successfully" });
    };
    unfreezePost = async (req, res) => {
        const { postId } = req.params;
        const userId = res.locals.user._id;
        const post = await this.postModel.findOne({
            filter: {
                _id: postId,
                createdBy: userId,
            },
        });
        if (!post)
            throw new Error_1.NotFoundException("Post not found");
        if (post.createdBy.toString() !== userId.toString()) {
            throw new Error_1.ApplicationException("You are not authorized to perform this action", 403);
        }
        if (!post.isFrozen) {
            throw new Error("Post is not frozen");
        }
        await post.updateOne({
            $set: {
                isFrozen: false,
                allowComments: true,
            },
        });
        return (0, successHandler_1.successHandler)({ res, data: "Post has been unfrozen successfully" });
    };
    hardDeletePost = async (req, res) => {
        const { postId } = req.params;
        const userId = res.locals.user._id;
        const post = await this.postModel.findOne({
            filter: {
                _id: postId,
                createdBy: userId,
            },
        });
        if (!post)
            throw new Error_1.NotFoundException("Post not found");
        if (post.createdBy.toString() !== userId.toString()) {
            throw new Error_1.ApplicationException("You are not authorized to perform this action", 403);
        }
        if (post.assestsFolderId) {
            try {
                await (0, s3_services_1.s3DeleteFolder)(`users/${userId}/posts/${post.assestsFolderId}`);
            }
            catch (err) {
                console.warn("Failed to delete S3 folder:", err);
            }
        }
        await this.postModel.delete({
            filter: { _id: postId },
        });
        return (0, successHandler_1.successHandler)({ res, data: "Post deleted" });
    };
}
exports.PostServices = PostServices;
