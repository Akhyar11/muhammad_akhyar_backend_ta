"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const antropomerty_controller_1 = __importDefault(require("./antropomerty.controller"));
class AnthropometryRoute {
    constructor() {
        this.route = (0, express_1.Router)();
        this.anthropometryController = new antropomerty_controller_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.route.get("/antropomerty/list/:id", this.anthropometryController.getAllById);
    }
}
exports.default = new AnthropometryRoute().route;
