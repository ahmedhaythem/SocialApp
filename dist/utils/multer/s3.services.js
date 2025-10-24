"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadSingleFile = void 0;
const fs_1 = require("fs");
const multer_1 = require("./multer");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3Config_1 = require("./s3Config");
const Error_1 = require("../Error");
const uploadSingleFile = async ({ Bucket = process.env.BUCKET_NAME, ACL = "private", path = "general", file, storeIn = multer_1.StoreIn.memory }) => {
    const commend = new client_s3_1.PutObjectCommand({
        Bucket,
        ACL,
        Key: `socialApp/${path}/${file.originalname}`,
        Body: storeIn == multer_1.StoreIn.memory
            ? file.buffer
            : (0, fs_1.createReadStream)(file.path),
        ContentType: file.mimetype
    });
    await (0, s3Config_1.s3Config)().send(commend);
    if (!commend.input.Key) {
        throw new Error_1.FileUploadException();
    }
    return commend.input.Key;
};
exports.uploadSingleFile = uploadSingleFile;
