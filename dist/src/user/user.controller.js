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
const user_model_1 = require("./user.model");
const bcrypt_1 = __importDefault(require("bcrypt")); // Perbaiki typo dari 'bycryp' menjadi 'bcrypt'
const logger_util_1 = __importDefault(require("../utils/logger.util")); // Import the logger
class UserController {
    constructor() {
        this.getAllUsers = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield user_model_1.userModel.readWithOptionsAndFields({
                    fields: ["password", "token"],
                });
                logger_util_1.default.info("Retrieved all users", { count: users.length });
                res.status(200).json(users);
            }
            catch (error) {
                logger_util_1.default.error("Failed to get users", { error });
                res.status(500).json({ error: "Failed to get users" });
            }
        });
        this.createUser = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { body } = req;
                if (!body.username || !body.password) {
                    logger_util_1.default.warn("Missing required fields for createUser", { body });
                    res.status(400).json({ error: "Missing required fields" });
                    return;
                }
                const user = yield user_model_1.userModel.search("username", "==", body.username);
                if (user.length > 0) {
                    logger_util_1.default.warn("Username is already taken", { username: body.username });
                    res.status(400).json({ error: "Username is already taken" });
                    return;
                }
                body.password = yield bcrypt_1.default.hash(body.password, 10);
                body.token = "";
                user_model_1.userModel.create(body);
                logger_util_1.default.info("User created successfully", { username: body.username });
                res.status(201).json({ message: "User created", data: body });
            }
            catch (error) {
                logger_util_1.default.error("Failed to create user", { error });
                res.status(500).json({ error: "Failed to create user" });
            }
        });
        this.updateUser = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                const { body } = req;
                const user = yield user_model_1.userModel.search("username", "==", body.username);
                if (user.length > 0) {
                    logger_util_1.default.warn("Username is already taken", { username: body.username });
                    res.status(400).json({ error: "Username is already taken" });
                    return;
                }
                if (body.password)
                    body.password = yield bcrypt_1.default.hash(body.password, 10);
                const oldUser = yield user_model_1.userModel.advancedSearch({
                    field: "id",
                    operator: "==",
                    value: id,
                    withOutFields: ["token"],
                });
                const newUser = Object.assign(Object.assign({}, oldUser[0]), body);
                user_model_1.userModel.update(id, newUser);
                logger_util_1.default.info("User updated successfully", { id });
                res.status(200).json({ message: "User updated", data: newUser });
            }
            catch (error) {
                logger_util_1.default.error("Failed to update user", { id, error });
                res.status(500).json({ error: "Failed to update user" });
            }
        });
        this.deleteUser = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                user_model_1.userModel.deleteWithRelation(id);
                logger_util_1.default.info("User deleted successfully", { id });
                res.status(200).json({ message: "User deleted" });
            }
            catch (error) {
                logger_util_1.default.error("Failed to delete user", { id, error });
                res.status(500).json({ error: "Failed to delete user" });
            }
        });
        this.getUserById = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                const user = yield user_model_1.userModel.search("id", "==", id);
                if (user.length === 0) {
                    logger_util_1.default.warn("User not found", { id });
                    res.status(404).json({ error: "User not found" });
                    return;
                }
                logger_util_1.default.info("Retrieved user by ID", { id });
                res.status(200).json(user);
            }
            catch (error) {
                logger_util_1.default.error("Failed to get user", { id, error });
                res.status(500).json({ error: "Failed to get user" });
            }
        });
    }
}
exports.default = UserController;
