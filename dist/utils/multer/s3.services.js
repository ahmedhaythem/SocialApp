"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPreSignedURL = exports.uploadMultiFiles = exports.uploadSingleLargeFile = exports.uploadSingleFile = void 0;
const fs_1 = require("fs");
const multer_1 = require("./multer");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3Config_1 = require("./s3Config");
const Error_1 = require("../Error");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const nanoid_1 = require("nanoid");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const uploadSingleFile = async ({ Bucket = process.env.BUCKET_NAME, ACL = "private", path = "general", file, storeIn = multer_1.StoreIn.memory }) => {
    const commend = new client_s3_1.PutObjectCommand({
        Bucket,
        ACL,
        Key: `socialApp/${path}/${(0, nanoid_1.nanoid)(15)}__${file.originalname}`,
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
const uploadSingleLargeFile = async ({ Bucket = process.env.BUCKET_NAME, ACL = "private", path = "general", file, storeIn = multer_1.StoreIn.memory }) => {
    const upload = new lib_storage_1.Upload({
        client: (0, s3Config_1.s3Config)(),
        partSize: 10 * 1024 * 1024,
        params: {
            Bucket,
            ACL,
            Key: `socialApp/${path}/${(0, nanoid_1.nanoid)(15)}__${file.originalname}`,
            Body: storeIn == multer_1.StoreIn.memory
                ? file.buffer
                : (0, fs_1.createReadStream)(file.path),
            ContentType: file.mimetype
        }
    });
    upload.on('httpUploadProgress', (process) => {
        console.log({ process });
    });
    const { Key } = await upload.done();
    if (!Key) {
        throw new Error_1.FileUploadException();
    }
    return Key;
};
exports.uploadSingleLargeFile = uploadSingleLargeFile;
const uploadMultiFiles = async ({ Bucket = process.env.BUCKET_NAME, ACL = "private", path = "general", files, storeIn = multer_1.StoreIn.memory }) => {
    const keys = Promise.all(storeIn == multer_1.StoreIn.memory ?
        files.map(file => {
            return (0, exports.uploadSingleFile)({
                Bucket,
                ACL,
                path,
                file,
                storeIn
            });
        })
        :
            files.map(file => {
                return (0, exports.uploadSingleLargeFile)({
                    Bucket,
                    ACL,
                    path,
                    file,
                    storeIn
                });
            }));
    return keys;
};
exports.uploadMultiFiles = uploadMultiFiles;
const createPreSignedURL = async ({ Bucket = process.env.AWS_BUCKET_NAME, path = "general", ContentType, Originalname, expiresIn = 120 }) => {
    const command = new client_s3_1.PutObjectCommand({
        Bucket,
        Key: `socialApp/${path}/${(0, nanoid_1.nanoid)(15)}-presigned-${Originalname}`,
        ContentType,
    });
    const url = await (0, s3_request_presigner_1.getSignedUrl)((0, s3Config_1.s3Config)(), command, {
        expiresIn,
    });
    if (!url || !command?.input?.Key) {
        throw new Error_1.ApplicationException("faild to generate presignedURL", 500);
    }
    return { url, Key: command.input.Key };
};
exports.createPreSignedURL = createPreSignedURL;
