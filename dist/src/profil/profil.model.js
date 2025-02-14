"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.profilModel = exports.ProfilSchema = void 0;
const jsonHandler_1 = __importDefault(require("../../jsonORM/jsonHandler"));
// Profil schema definition
exports.ProfilSchema = {
    userId: "string",
    nama_lengkap: "string",
    avatarUrl: "string",
    summary: "string",
};
exports.profilModel = new jsonHandler_1.default("profil", exports.ProfilSchema);
