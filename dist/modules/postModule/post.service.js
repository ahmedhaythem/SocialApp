"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostServices = void 0;
const successHandler_1 = require("../../utils/successHandler");
const auth_repo_1 = require("../authModule/auth.repo");
const post_repo_1 = require("./post.repo");
const post_model_1 = require("../../DB/models/post.model");
const Error_1 = require("../../utils/Error");
class PostServices {
    postModel = new post_repo_1.PostRepo();
    userModel = new auth_repo_1.UserRepo();
    createPost = async (req, res) => {
        // const {allowComments, availability, content, tags}:createPostDTO=req.body
        const files = req.files || [];
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
        // let attachments=[]
        // if(files?.length){
        // }
        const post = await this.postModel.create({
            data: {
                ...req.body,
                // attachments,
                createdBy: res.locals.user._id,
                // assestsFolderId
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
}
exports.PostServices = PostServices;
