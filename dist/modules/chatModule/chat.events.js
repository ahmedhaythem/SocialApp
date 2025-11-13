"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatEvent = void 0;
const chat_socket_service_1 = require("./chat.socket.service");
class ChatEvent {
    chatSocketServieces = new chat_socket_service_1.ChatSocketServieces();
    constructor() { }
    sendMessage = async (socket) => {
        socket.on("sendMessage", (data) => {
            return this.chatSocketServieces.sendMessage(socket, data);
        });
    };
}
exports.ChatEvent = ChatEvent;
