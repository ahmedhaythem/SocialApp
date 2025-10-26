"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepo = void 0;
const DBRepo_1 = require("../../DB/DBRepo");
const user_model_1 = require("../../DB/models/user.model");
class UserRepo extends DBRepo_1.DBRepo {
    model;
    constructor(model = user_model_1.UserModel) {
        super(model);
        this.model = model;
    }
    findByEmail = async ({ email, projection, options }) => {
        const user = await this.model.findOne({ email }, projection, options);
        return user;
    };
    updateOne = async ({ filter, update, }) => {
        const user = await this.model.updateOne(filter, update);
        return user;
    };
}
exports.UserRepo = UserRepo;
