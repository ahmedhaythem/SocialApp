"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRoutes = void 0;
const auth_middleware_1 = require("../../middleware/auth.middleware");
const chat_rest_service_1 = require("./chat.rest.service");
const express_1 = require("express");
const router = (0, express_1.Router)({
    mergeParams: true
});
exports.chatRoutes = {
    base: "/chats",
    getChat: "/"
};
const chatServieces = new chat_rest_service_1.ChatServieces();
router.get(exports.chatRoutes.getChat, (0, auth_middleware_1.auth)(), chatServieces.getChat);
exports.default = router;
