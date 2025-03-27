"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const profil_model_1 = require("./profil.model");
const user_model_1 = require("../user/user.model");
const validation_util_1 = require("../utils/validation.util");
const logger_util_1 = __importDefault(require("../utils/logger.util"));
const google_drive_util_1 = require("../utils/google.drive.util");
class ProfilController {
    createProfil(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const profilData = req.body;
                profilData.avatarUrl = "";
                profilData.summary = "";
                const validationResult = (0, validation_util_1.validateData)(profil_model_1.ProfilSchema, profilData);
                if (validationResult !== true) {
                    logger_util_1.default.warn("Validation failed for createProfil", { validationResult });
                    res.status(400).json(validationResult);
                    return;
                }
                const user = yield user_model_1.userModel.search("id", "==", profilData.userId);
                if (user.length === 0) {
                    logger_util_1.default.warn("User not found for createProfil", {
                        userId: profilData.userId,
                    });
                    res.status(404).json({ message: "User not found." });
                    return;
                }
                yield profil_model_1.profilModel.create(profilData);
                logger_util_1.default.info("Profil created successfully", { profilData });
                res.status(201).json({ message: "Profil created successfully." });
            }
            catch (error) {
                logger_util_1.default.error("Error in createProfil", { error });
                res.status(400).json({ message: "Internal server error" });
            }
        });
    }
    getAllProfils(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const profils = yield profil_model_1.profilModel.read();
                logger_util_1.default.info("Retrieved all profils", { count: profils.length });
                res.status(200).json(profils);
            }
            catch (error) {
                logger_util_1.default.error("Failed to retrieve profils", { error });
                res.status(500).json({ message: "Failed to retrieve profils." });
            }
        });
    }
    getProfilById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                const profils = yield profil_model_1.profilModel.read();
                const profil = profils.find((p) => p.id === id);
                if (!profil) {
                    logger_util_1.default.warn("Profil not found", { id });
                    res.status(404).json({ message: "Profil not found." });
                    return;
                }
                logger_util_1.default.info("Retrieved profil by ID", { id });
                res.status(200).json(profil);
            }
            catch (error) {
                logger_util_1.default.error("Failed to retrieve profil by ID", { id, error });
                res.status(500).json({ message: "Failed to retrieve profil." });
            }
        });
    }
    getProfilByUserId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId } = req.params;
            try {
                const profils = yield profil_model_1.profilModel.read();
                const profil = profils.find((p) => p.userId === userId);
                if (!profil) {
                    logger_util_1.default.warn("Profil not found by userId", { userId });
                    const newProfil = {
                        userId,
                        avatarUrl: "",
                        avatarFileId: "", // Tambahkan field untuk menyimpan fileId dari Google Drive
                        nama_lengkap: "",
                        summary: "",
                    };
                    yield profil_model_1.profilModel.create(newProfil);
                    logger_util_1.default.info("Profil created successfully for userId", { userId });
                    const profils = yield profil_model_1.profilModel.read();
                    const profil = profils.find((p) => p.userId === userId);
                    res.status(200).json(profil);
                    return;
                }
                logger_util_1.default.info("Retrieved profil by userId", { userId });
                res.status(200).json(profil);
            }
            catch (error) {
                logger_util_1.default.error("Failed to retrieve profil by userId", { userId, error });
                res.status(500).json({ message: "Failed to retrieve profil." });
            }
        });
    }
    updateProfil(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const profilData = req.body;
            try {
                // chekc if username already
                yield profil_model_1.profilModel.update(id, profilData);
                logger_util_1.default.info("Profil updated successfully", { id, profilData });
                res.status(200).json({ message: "Profil updated successfully." });
            }
            catch (error) {
                logger_util_1.default.error("Error in updateProfil", { id, error });
                res.status(400).json({ message: "Internal server error" });
            }
        });
    }
    deleteProfil(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                yield profil_model_1.profilModel.delete(id);
                logger_util_1.default.info("Profil deleted successfully", { id });
                res.status(200).json({ message: "Profil deleted successfully." });
            }
            catch (error) {
                logger_util_1.default.error("Error in deleteProfil", { id, error });
                res.status(400).json({ message: "Internal server error" });
            }
        });
    }
    uploadProfilePicture(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                // Pastikan file ada dalam request
                if (!req.file) {
                    res.status(400).json({ message: "No file uploaded" });
                    return;
                }
                // Dapatkan data profil
                const profils = yield profil_model_1.profilModel.search("id", "==", id);
                const profil = profils[0];
                if (!profil) {
                    res.status(404).json({ message: "Profil not found" });
                    return;
                }
                // Jika sudah ada foto profil sebelumnya, hapus dari Google Drive
                if (profil.avatarFileId) {
                    try {
                        yield (0, google_drive_util_1.deleteFileFromDrive)(profil.avatarFileId);
                    }
                    catch (error) {
                        logger_util_1.default.warn("Failed to delete previous profile picture", {
                            id,
                            error,
                        });
                    }
                }
                // Upload file baru ke Google Drive
                const fileName = `profile_${id}_${Date.now()}${req.file.originalname.substring(req.file.originalname.lastIndexOf("."))}`;
                const { fileId, webContentLink } = yield (0, google_drive_util_1.uploadBufferToDrive)(req.file.buffer, fileName, req.file.mimetype);
                // Update data profil dengan URL dan fileId baru
                yield profil_model_1.profilModel.update(id, {
                    avatarUrl: webContentLink,
                    avatarFileId: fileId,
                });
                logger_util_1.default.info("Profile picture uploaded successfully", { id });
                res.status(200).json({
                    message: "Profile picture uploaded successfully",
                    avatarUrl: webContentLink,
                });
                return;
            }
            catch (error) {
                logger_util_1.default.error("Failed to upload profile picture", { error });
                res.status(500).json({ message: "Failed to upload profile picture" });
                return;
            }
        });
    }
    getProfilePicture(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                // Dapatkan data profil
                const profils = yield profil_model_1.profilModel.search("id", "==", id);
                const profil = profils[0];
                if (!profil) {
                    res.status(404).json({ message: "Profil not found" });
                    return;
                }
                // Jika tidak ada foto profil
                if (!profil.avatarFileId) {
                    res.status(404).json({ message: "Profile picture not found" });
                    return;
                }
                // Ambil file dari Google Drive
                const fileBuffer = yield (0, google_drive_util_1.getFileFromDrive)(profil.avatarFileId);
                // Tentukan tipe konten berdasarkan ekstensi file atau default ke image/jpeg
                const fileExtension = profil.avatarUrl
                    .substring(profil.avatarUrl.lastIndexOf(".") + 1)
                    .toLowerCase();
                let contentType = "image/jpeg"; // Default
                if (fileExtension === "png")
                    contentType = "image/png";
                else if (fileExtension === "gif")
                    contentType = "image/gif";
                else if (fileExtension === "webp")
                    contentType = "image/webp";
                // Kirim file sebagai response
                res.setHeader("Content-Type", contentType);
                res.send(fileBuffer);
                return;
            }
            catch (error) {
                logger_util_1.default.error("Failed to get profile picture", { error });
                res.status(500).json({ message: "Failed to get profile picture" });
                return;
            }
        });
    }
    deleteProfilePicture(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                // Dapatkan data profil
                const profils = yield profil_model_1.profilModel.search("id", "==", id);
                const profil = profils[0];
                if (!profil) {
                    res.status(404).json({ message: "Profil not found" });
                    return;
                }
                // Jika tidak ada foto profil
                if (!profil.avatarFileId) {
                    res.status(404).json({ message: "Profile picture not found" });
                    return;
                }
                // Hapus file dari Google Drive
                yield (0, google_drive_util_1.deleteFileFromDrive)(profil.avatarFileId);
                // Update data profil
                yield profil_model_1.profilModel.update(id, {
                    avatarUrl: "",
                    avatarFileId: "",
                });
                logger_util_1.default.info("Profile picture deleted successfully", { id });
                res.status(200).json({ message: "Profile picture deleted successfully" });
                return;
            }
            catch (error) {
                logger_util_1.default.error("Failed to delete profile picture", { error });
                res.status(500).json({ message: "Failed to delete profile picture" });
                return;
            }
        });
    }
}
exports.default = ProfilController;
