"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = require("../user/user.model");
const bcrypt_1 = __importDefault(require("bcrypt")); // Perbaiki typo dari 'bycryp' menjadi 'bcrypt'
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_util_1 = __importDefault(require("../utils/logger.util")); // Import the logger
class AuthController {
    constructor() {
        this.login = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { body } = req;
                const user = user_model_1.userModel.search("username", "==", body.username);
                if (user.length === 0) {
                    logger_util_1.default.warn("Login attempt with invalid username", {
                        username: body.username,
                    });
                    res.status(401).json({ message: "Invalid username or password" });
                    return;
                }
                const isPasswordCorrect = yield bcrypt_1.default.compare(body.password, user[0].password);
                if (!isPasswordCorrect) {
                    logger_util_1.default.warn("Login attempt with invalid password", {
                        username: body.username,
                    });
                    res.status(401).json({ message: "Invalid username or password" });
                    return;
                }
                if (!process.env.JWT_SECRET) {
                    logger_util_1.default.error("JWT_SECRET is not defined");
                    throw new Error("JWT_SECRET is not defined");
                }
                const token = jsonwebtoken_1.default.sign({ id: user[0].id, username: user[0].username }, process.env.JWT_SECRET);
                user_model_1.userModel.update(user[0].id, Object.assign(Object.assign({}, user[0]), { token }));
                logger_util_1.default.info("User logged in successfully", {
                    username: user[0].username,
                });
                res.status(200).json({ token, id: user[0].id, username: body.username });
            }
            catch (error) {
                console.log(error);
                logger_util_1.default.error("Failed to login", { error });
                res.status(500).json({ message: "Failed to login, server error" });
            }
        });
        this.logout = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { body } = req;
                const user = user_model_1.userModel.search("token", "==", body.token);
                if (user.length === 0) {
                    logger_util_1.default.warn("Logout attempt with invalid token", { token: body.token });
                    res.status(401).json({ message: "Invalid token" });
                    return;
                }
                const isPasswordCorrect = yield bcrypt_1.default.compare(body.password, user[0].password);
                if (!isPasswordCorrect) {
                    logger_util_1.default.warn("Logout attempt with invalid password", {
                        username: user[0].username,
                    });
                    res.status(401).json({ message: "Invalid password" });
                    return;
                }
                user_model_1.userModel.update(user[0].id, Object.assign(Object.assign({}, user[0]), { token: "" }));
                logger_util_1.default.info("User logged out successfully", {
                    username: user[0].username,
                });
                res.status(200).json({ message: "Logged out" });
            }
            catch (error) {
                logger_util_1.default.error("Failed to logout", { error });
                res.status(500).json({ message: "Failed to logout" });
            }
        });
        this.register = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { body } = req;
                const user = user_model_1.userModel.search("username", "==", body.username);
                if (user[0]) {
                    logger_util_1.default.warn("Registration attempt for existing user", {
                        username: body.username,
                    });
                    res.status(401).json({ message: "User already exists" });
                    return;
                }
                const hashedPassword = yield bcrypt_1.default.hash(body.password, 10);
                const dummyUser = {
                    username: "dummy",
                    password: "dummy",
                    jk: "",
                    tgl_lahir: "",
                    token: "",
                    iotIsAllowed: false,
                };
                const newUser = user_model_1.userModel.create(Object.assign(Object.assign(Object.assign({}, dummyUser), body), { password: hashedPassword }));
                logger_util_1.default.info("User registered successfully", {
                    username: dummyUser.username,
                });
                res.status(200).json({ message: "User created", user: newUser });
            }
            catch (error) {
                logger_util_1.default.error("Failed to register user", { error });
                res.status(500).json({ message: "Failed to register" });
            }
        });
        this.me = (req, res) => {
            try {
                const { body } = req;
                if (!body.token || body.token === "") {
                    logger_util_1.default.warn("Token is required for me endpoint");
                    res.status(401).json({ message: "Token is required" });
                    return;
                }
                const user = user_model_1.userModel.advancedSearch({
                    field: "token",
                    operator: "==",
                    value: body.token,
                    withOutFields: ["password", "token"],
                });
                if (user.length === 0) {
                    logger_util_1.default.warn("Invalid token used in me endpoint", { token: body.token });
                    res.status(401).json({ message: "not login, please login" });
                    return;
                }
                logger_util_1.default.info("User retrieved successfully from me endpoint", {
                    username: user[0].username,
                });
                res.status(200).json({ data: user[0] });
            }
            catch (error) {
                console.log(error);
                logger_util_1.default.error("Failed to get user from me endpoint", { error });
                res.status(500).json({ message: "Failed to get user" });
            }
        };
    }
}
exports.default = AuthController;
