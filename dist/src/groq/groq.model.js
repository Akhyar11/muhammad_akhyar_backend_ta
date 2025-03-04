"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertationModel = exports.groqModel = exports.ConvertationSchema = exports.GroqSchema = void 0;
const jsonHandler_1 = __importDefault(require("../../jsonORM/jsonHandler"));
exports.GroqSchema = {
    userId: "string",
    title: "string",
};
exports.ConvertationSchema = {
    userId: "string",
    userMessage: "string",
    AIMessage: "string",
};
const groqModel = new jsonHandler_1.default("groq", exports.GroqSchema);
exports.groqModel = groqModel;
const convertationModel = new jsonHandler_1.default("convertation", exports.ConvertationSchema);
exports.convertationModel = convertationModel;
groqModel.setRelation("convertation", {
    model: convertationModel,
    type: "one-to-many",
    foreignKey: "groqId",
    localKey: "id",
});
