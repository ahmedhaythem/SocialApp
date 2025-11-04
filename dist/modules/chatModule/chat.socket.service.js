"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatSocketServieces = void 0;
class ChatSocketServieces {
    constructor() { }
    sayHi = (message, callback) => {
        console.log(message);
        callback("hello");
    };
}
exports.ChatSocketServieces = ChatSocketServieces;
