"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserServices = void 0;
class UserServices {
    constructor() { }
    sayHello(req, res, next) {
        throw new Error("not found", { cause: 404 });
        return res.json({ msg: 'hello world' });
    }
    getUser(req, res, next) {
        return res.json({
            name: "ahmed",
            age: 25
        });
    }
}
exports.UserServices = UserServices;
