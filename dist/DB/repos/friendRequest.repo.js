"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.friendRequestRepo = void 0;
const DBRepo_1 = require("../DBRepo");
const friendRequest_model_1 = require("../models/friendRequest.model");
class friendRequestRepo extends DBRepo_1.DBRepo {
    constructor() {
        super(friendRequest_model_1.FreindRequestModel);
    }
}
exports.friendRequestRepo = friendRequestRepo;
