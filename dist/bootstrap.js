"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrap = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const routes_1 = __importDefault(require("./routes"));
const db_connection_1 = require("./DB/db.connection");
dotenv_1.default.config({
    path: path_1.default.resolve('./src/config/.env')
});
const app = (0, express_1.default)();
const bootstrap = async () => {
    const port = process.env.PORT;
    await (0, db_connection_1.ConnnectDB)();
    // sendEmail()
    app.use(express_1.default.json());
    app.use("/api/v1", routes_1.default);
    app.use((err, req, res, next) => {
        return res.status(err.statusCode || 500).json({
            errMsg: err.message,
            status: err.statusCode || 500,
            stack: err.stack
        });
    });
    app.listen(port, () => {
        console.log("Server is running on port: " + port);
    });
};
exports.bootstrap = bootstrap;
