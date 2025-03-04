"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userModel = exports.UserSchema = void 0;
const jsonHandler_1 = __importDefault(require("../../jsonORM/jsonHandler"));
const antropomerty_model_1 = require("../anthropometry/antropomerty.model");
const groq_model_1 = require("../groq/groq.model");
const profil_model_1 = require("../profil/profil.model");
// User schema definition
exports.UserSchema = {
    id: "string",
    username: "string",
    password: "string",
    jk: "boolean",
    tgl_lahir: "string",
    token: "string",
    iotIsAllowed: "boolean",
};
const userModel = new jsonHandler_1.default("user", exports.UserSchema);
exports.userModel = userModel;
userModel.setRelation("antropometry", {
    model: antropomerty_model_1.anthropometryModel,
    type: "one-to-many",
    foreignKey: "userId",
    localKey: "id"
});
userModel.setRelation("profil", {
    model: profil_model_1.profilModel,
    type: "one-to-one",
    foreignKey: "userId",
    localKey: "id"
});
userModel.setRelation("groq", {
    model: groq_model_1.groqModel,
    type: "one-to-many",
    foreignKey: "userId",
    localKey: "id"
});
