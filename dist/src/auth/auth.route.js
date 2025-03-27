"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = __importDefault(require("./auth.controller"));
class AuthRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.authController = new auth_controller_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post("/login", this.authController.login);
        this.router.post("/register", this.authController.register);
        this.router.post("/logout", this.authController.logout);
        this.router.post("/me", this.authController.me);
    }
}
exports.default = new AuthRoute().router;
