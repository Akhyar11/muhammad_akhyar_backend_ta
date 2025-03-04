"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const groq_controller_1 = __importDefault(require("./groq.controller"));
class ConvertationRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.groqController = new groq_controller_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/convertation", this.groqController.getConvertation);
        this.router.post("/convertation", this.groqController.createConvertation);
    }
}
exports.default = new ConvertationRoute().router;
