"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnnectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ConnnectDB = () => {
    mongoose_1.default.connect('mongodb://127.0.0.1:27017/socailApp')
        .then(() => {
        console.log("DB connected successfully");
    })
        .catch((err) => {
        console.log("DB connection failed =>", err);
    });
};
exports.ConnnectDB = ConnnectDB;
