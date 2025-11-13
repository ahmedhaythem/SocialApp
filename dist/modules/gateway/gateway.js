"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inilialize = void 0;
const socket_io_1 = require("socket.io");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const chat_gateway_1 = require("../chatModule/chat.gateway");
const connectedSockets = new Map();
const connect = (socket) => {
    const currentSockets = connectedSockets.get(socket.user?._id.toString()) || [];
    currentSockets.push(socket.id);
    connectedSockets.set(socket.user?._id.toString(), [socket.id]);
};
const disconnect = (socket) => {
    socket.on('disconnect', () => {
        let currentSockets = connectedSockets.get(socket.user?._id.toString()) || [];
        currentSockets = currentSockets.filter(id => {
            return id != socket.id;
        });
        connectedSockets.set(socket.user?.toString(), currentSockets);
    });
};
const inilialize = (httpServer) => {
    const chatGateway = new chat_gateway_1.ChatGateway();
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: '*'
        }
    });
    io.use(async (socket, next) => {
        try {
            const data = await (0, auth_middleware_1.decodeToken)({ authorization: socket.handshake.auth.authorization, tokenTypes: auth_middleware_1.TokenTypesEnum.access });
            socket.user = data.user;
            next();
        }
        catch (error) {
            next(error);
        }
    });
    io.on("connection", (socket) => {
        chatGateway.register(socket);
        connect(socket);
        disconnect(socket);
    });
};
exports.inilialize = inilialize;
