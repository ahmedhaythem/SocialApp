"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = exports.decodeToken = exports.TokenTypesEnum = void 0;
const user_model_1 = require("../DB/models/user.model");
const auth_repo_1 = require("../modules/authModule/auth.repo");
const Error_1 = require("../utils/Error");
const jwt_1 = require("../utils/jwt");
var TokenTypesEnum;
(function (TokenTypesEnum) {
    TokenTypesEnum["access"] = "access";
    TokenTypesEnum["referesh"] = "refresh";
})(TokenTypesEnum || (exports.TokenTypesEnum = TokenTypesEnum = {}));
const userModel = new auth_repo_1.UserRepo(user_model_1.UserModel);
const decodeToken = async ({ authorization, tokenTypes = TokenTypesEnum.access }) => {
    if (!authorization) {
        throw new Error_1.InvalidTokenException();
    }
    if (authorization.startsWith(process.env.BEARER_KEY)) {
        throw new Error_1.InvalidTokenException();
    }
    const token = authorization.split(' ')[1];
    if (!token) {
        throw new Error_1.InvalidTokenException();
    }
    const payload = (0, jwt_1.verifyJWT)({
        token,
        secret: tokenTypes == TokenTypesEnum.access ?
            process.env.ACCESS_SIGNATURE :
            process.env.REFRESH_SIGNATURE
    });
    const user = await userModel.findById({ id: payload.id });
    if (!user) {
        throw new Error_1.NotFoundException("user not found");
    }
    if (!user.confirmed) {
        throw new Error_1.NotConfirmedException();
    }
    if (user.isCredentialsUpdated?.getTime() >= payload.iat * 1000) {
        throw new Error_1.ApplicationException('please login again', 409);
    }
    return { user, payload };
};
exports.decodeToken = decodeToken;
const auth = () => {
    return async (req, res, next) => {
        const { user, payload } = await (0, exports.decodeToken)({ authorization: req.headers.authorization });
        res.locals.user = user;
        res.locals.payload = payload;
        next();
    };
};
exports.auth = auth;
