"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRoutes = void 0;
const chat_rest_service_1 = require("./chat.rest.service");
const express_1 = require("express");
const router = (0, express_1.Router)();
exports.chatRoutes = {
    base: "/chats"
};
const chatServieces = new chat_rest_service_1.ChatServieces();
exports.default = router;
