"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostServices = void 0;
const successHandler_1 = require("../../utils/successHandler");
class PostServices {
    createPost = async (req, res) => {
        console.log(req.body);
        return (0, successHandler_1.successHandler)({ res });
    };
}
exports.PostServices = PostServices;
