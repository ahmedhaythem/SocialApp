"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatSocketServieces = void 0;
const Error_1 = require("../../utils/Error");
const auth_repo_1 = require("../authModule/auth.repo");
const chat_reop_1 = require("./chat.reop");
class ChatSocketServieces {
    userModel = new auth_repo_1.UserRepo();
    chatModel = new chat_reop_1.ChatRepo();
    constructor() { }
    sendMessage = async (socket, data) => {
        try {
            const createdBy = socket.user?._id;
            const to = await this.userModel.findById({ id: data.senTo });
            if (!to) {
                throw new Error("user not found");
            }
            console.log({ createdBy, to: to._id });
            const chat = await this.chatModel.findOne({
                filter: {
                    participants: {
                        $all: [to._id, createdBy]
                    },
                    group: {
                        $exists: false
                    }
                }
            });
            console.log({ chat });
            if (!chat) {
                throw new Error_1.NotFoundException('chat not found');
            }
            chat.message.push({ content: data.content, createdBy });
            await chat.save();
        }
        catch (error) {
            socket.emit('customError', error);
        }
    };
}
exports.ChatSocketServieces = ChatSocketServieces;
