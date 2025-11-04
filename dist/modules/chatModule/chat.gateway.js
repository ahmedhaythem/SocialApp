"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGatewaay = void 0;
const chat_events_1 = require("./chat.events");
class ChatGatewaay {
    chatEvent = new chat_events_1.ChatEvent();
    constructor() { }
    register = (socket) => {
        this.chatEvent.sayHi(socket);
    };
}
exports.ChatGatewaay = ChatGatewaay;
