"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.anthropometryModel = exports.AnthropometrySchema = void 0;
const FirebaseService_1 = __importDefault(require("../../firebaseORM/FirebaseService"));
const firebase_config_1 = require("../utils/firebase.config");
exports.AnthropometrySchema = {
    id: "string",
    userId: "string",
    height: "string",
    weight: "string",
    bmi: "string",
    kms_bb: "string",
    kms_tb: "string",
    age: "number",
    months: "number",
    date: "string",
    notes: "string",
};
exports.anthropometryModel = new FirebaseService_1.default("anthropometry", exports.AnthropometrySchema, firebase_config_1.firebaseConfig);
