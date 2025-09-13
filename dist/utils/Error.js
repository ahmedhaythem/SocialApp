"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = exports.ApplicationException = void 0;
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
