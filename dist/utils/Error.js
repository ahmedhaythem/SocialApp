"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUploadException = exports.NotConfirmedException = exports.InvalidOTPException = exports.InvalidTokenException = exports.NotFoundException = exports.NotValidEmail = exports.ValidationError = exports.ApplicationException = void 0;
class ApplicationException extends Error {
    statusCode;
    constructor(msg, statusCode, options) {
        super(msg, options);
        this.statusCode = statusCode;
    }
}
exports.ApplicationException = ApplicationException;
class ValidationError extends ApplicationException {
    constructor(msg) {
        super(msg, 422);
        console.log(this.stack);
    }
}
exports.ValidationError = ValidationError;
class NotValidEmail extends ApplicationException {
    constructor(msg = "not vaild email") {
        super(msg, 400);
        console.log(this.stack);
    }
}
exports.NotValidEmail = NotValidEmail;
class NotFoundException extends ApplicationException {
    constructor(msg = "not found") {
        super(msg, 404);
        console.log(this.stack);
    }
}
exports.NotFoundException = NotFoundException;
class InvalidTokenException extends ApplicationException {
    constructor(msg = "in-valid token") {
        super(msg, 409);
        console.log(this.stack);
    }
}
exports.InvalidTokenException = InvalidTokenException;
class InvalidOTPException extends ApplicationException {
    constructor(msg = "in-valid OTP") {
        super(msg, 409);
        console.log(this.stack);
    }
}
exports.InvalidOTPException = InvalidOTPException;
class NotConfirmedException extends ApplicationException {
    constructor(msg = "user not confirmed") {
        super(msg, 401);
        console.log(this.stack);
    }
}
exports.NotConfirmedException = NotConfirmedException;
class FileUploadException extends ApplicationException {
    constructor(msg = 'upload file failed') {
        super(msg, 400);
    }
}
exports.FileUploadException = FileUploadException;
