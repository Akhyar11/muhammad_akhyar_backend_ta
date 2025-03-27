"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = __importDefault(require("./user.controller"));
class UserRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.userController = new user_controller_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/users", this.userController.getAllUsers);
        this.router.get("/users/:id", this.userController.getUserById);
        this.router.post("/users", this.userController.createUser);
        this.router.put("/users/:id", this.userController.updateUser);
        this.router.delete("/users/:id", this.userController.deleteUser);
        this.router.put("/users/:id/password", this.userController.updatePassword);
    }
}
exports.default = new UserRoute().router;
