"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertationModel = exports.groqModel = exports.ConvertationSchema = exports.GroqSchema = void 0;
const FirebaseService_1 = __importDefault(require("../../firebaseORM/FirebaseService"));
const firebase_config_1 = require("../utils/firebase.config");
exports.GroqSchema = {
    userId: "string",
    title: "string",
};
exports.ConvertationSchema = {
    userId: "string",
    userMessage: "string",
    AIMessage: "string",
};
const groqModel = new FirebaseService_1.default("groq", exports.GroqSchema, firebase_config_1.firebaseConfig);
exports.groqModel = groqModel;
const convertationModel = new FirebaseService_1.default("convertation", exports.ConvertationSchema, firebase_config_1.firebaseConfig);
exports.convertationModel = convertationModel;
groqModel.setRelation("convertation", {
    model: convertationModel,
    type: "one-to-many",
    foreignKey: "groqId",
    localKey: "id",
});
