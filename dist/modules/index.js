"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRoutes = exports.chatRouter = exports.postRoutes = exports.postRouter = void 0;
// export {authRouter,authRoutes} from './authModule'
var postModule_1 = require("./postModule");
Object.defineProperty(exports, "postRouter", { enumerable: true, get: function () { return postModule_1.postRouter; } });
Object.defineProperty(exports, "postRoutes", { enumerable: true, get: function () { return postModule_1.postRoutes; } });
var chatModule_1 = require("./chatModule");
Object.defineProperty(exports, "chatRouter", { enumerable: true, get: function () { return chatModule_1.chatRouter; } });
Object.defineProperty(exports, "chatRoutes", { enumerable: true, get: function () { return chatModule_1.chatRoutes; } });
