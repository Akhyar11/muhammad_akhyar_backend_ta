"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const antropomerty_iot_controller_1 = __importDefault(require("./antropomerty.iot.controller"));
class AnthropometryIotRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.anthropometryIotController = new antropomerty_iot_controller_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/iot/data", this.anthropometryIotController.setData);
    }
}
exports.default = new AnthropometryIotRoute().router;
