"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.successHandler = void 0;
const successHandler = ({ res, msg = "Done", data = {}, status = 200 }) => {
    return res.status(status).json({
        msg,
        status,
        data
    });
};
exports.successHandler = successHandler;
