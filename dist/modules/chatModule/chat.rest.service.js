"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatServieces = void 0;
const mongoose_1 = require("mongoose");
const Error_1 = require("../../utils/Error");
const auth_repo_1 = require("./../authModule/auth.repo");
const chat_reop_1 = require("./chat.reop");
const successHandler_1 = require("../../utils/successHandler");
class ChatServieces {
    userRepo = new auth_repo_1.UserRepo();
    chatRepo = new chat_reop_1.ChatRepo();
    constructor() { }
    getChat = async (req, res) => {
        const loggedUser = res.locals.user;
        const userId = mongoose_1.Types.ObjectId.createFromHexString(req.params.userId);
        const to = await this.userRepo.findOne({
            filter: {
                _id: userId,
                friends: {
                    $in: [loggedUser._id]
                }
            }
        });
        if (!to) {
            throw new Error_1.NotFoundException('user not found');
        }
        const chat = await this.chatRepo.findOne({
            filter: {
                participants: {
                    $all: [to._id, loggedUser._id]
                },
                group: {
                    $exists: false
                }
            },
            options: {
                populate: 'participants'
            }
        });
        if (!chat) {
            const newChat = await this.chatRepo.create({
                data: {
                    participants: [to._id, loggedUser._id],
                    createdBy: loggedUser._id,
                    message: []
                }
            });
            // console.log("hahahahahahahahaah");
            return (0, successHandler_1.successHandler)({ res, data: newChat });
        }
        return (0, successHandler_1.successHandler)({ res, data: chat });
    };
}
exports.ChatServieces = ChatServieces;
