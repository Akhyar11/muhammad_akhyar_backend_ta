"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const profil_controller_1 = __importDefault(require("./profil.controller"));
class ProfilRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.profilController = new profil_controller_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/profils", this.profilController.getAllProfils); // Mendapatkan semua profil
        this.router.get("/profils/:id", this.profilController.getProfilById); // Mendapatkan profil berdasarkan ID
        this.router.get("/profils/user/:userId", this.profilController.getProfilByUserId); // Mendapatkan profil berdasarkan userId
        this.router.post("/profils", this.profilController.createProfil); // Menambahkan profil baru
        this.router.put("/profils/:id", this.profilController.updateProfil); // Memperbarui profil berdasarkan ID
        this.router.delete("/profils/:id", this.profilController.deleteProfil); // Menghapus profil berdasarkan ID
        // Rute untuk meng-upload foto pengguna
        this.router.post("/profils/:id/upload", this.profilController.uploadProfilePicture);
        this.router.get("/profils/:id/avatar", this.profilController.getProfilePicture);
        this.router.delete("/profils/:id/avatar", this.profilController.deleteProfilePicture);
    }
}
exports.default = new ProfilRoute().router; // Ekspor instance router
