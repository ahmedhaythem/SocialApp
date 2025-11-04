"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatEvent = void 0;
const chat_socket_service_1 = require("./chat.socket.service");
class ChatEvent {
    chatSocketServieces = new chat_socket_service_1.ChatSocketServieces();
    constructor() { }
    sayHi = (socket) => {
        socket.on('sayHi', (message, callback) => {
            return this.chatSocketServieces.sayHi(message, callback);
        });
    };
}
exports.ChatEvent = ChatEvent;
