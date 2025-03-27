"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userModel = exports.UserSchema = void 0;
const antropomerty_model_1 = require("../anthropometry/antropomerty.model");
const groq_model_1 = require("../groq/groq.model");
const profil_model_1 = require("../profil/profil.model");
const FirebaseService_1 = __importDefault(require("../../firebaseORM/FirebaseService"));
const firebase_config_1 = require("../utils/firebase.config");
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
const userModel = new FirebaseService_1.default("users", exports.UserSchema, firebase_config_1.firebaseConfig);
exports.userModel = userModel;
userModel.setRelation("antropometry", {
    model: antropomerty_model_1.anthropometryModel,
    type: "one-to-many",
    foreignKey: "userId",
    localKey: "id",
});
userModel.setRelation("profil", {
    model: profil_model_1.profilModel,
    type: "one-to-one",
    foreignKey: "userId",
    localKey: "id",
});
userModel.setRelation("groq", {
    model: groq_model_1.groqModel,
    type: "one-to-many",
    foreignKey: "userId",
    localKey: "id",
});
