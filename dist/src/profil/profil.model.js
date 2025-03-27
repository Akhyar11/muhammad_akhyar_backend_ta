"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.profilModel = exports.ProfilSchema = void 0;
const FirebaseService_1 = __importDefault(require("../../firebaseORM/FirebaseService"));
const firebase_config_1 = require("../utils/firebase.config");
// Profil schema definition
exports.ProfilSchema = {
    userId: "string",
    nama_lengkap: "string",
    avatarUrl: "string",
    summary: "string",
};
exports.profilModel = new FirebaseService_1.default("profil", exports.ProfilSchema, firebase_config_1.firebaseConfig);
