"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const profil_model_1 = require("./profil.model");
const user_model_1 = require("../user/user.model");
const validation_util_1 = require("../utils/validation.util");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const logger_util_1 = __importDefault(require("../utils/logger.util"));
class ProfilController {
    createProfil(req, res) {
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
            const user = user_model_1.userModel.search("id", "==", profilData.userId);
            if (user.length === 0) {
                logger_util_1.default.warn("User not found for createProfil", {
                    userId: profilData.userId,
                });
                res.status(404).json({ message: "User not found." });
                return;
            }
            profil_model_1.profilModel.create(profilData);
            logger_util_1.default.info("Profil created successfully", { profilData });
            res.status(201).json({ message: "Profil created successfully." });
        }
        catch (error) {
            logger_util_1.default.error("Error in createProfil", { error });
            res.status(400).json({ message: "Internal server error" });
        }
    }
    getAllProfils(req, res) {
        try {
            const profils = profil_model_1.profilModel.read();
            logger_util_1.default.info("Retrieved all profils", { count: profils.length });
            res.status(200).json(profils);
        }
        catch (error) {
            logger_util_1.default.error("Failed to retrieve profils", { error });
            res.status(500).json({ message: "Failed to retrieve profils." });
        }
    }
    getProfilById(req, res) {
        const { id } = req.params;
        try {
            const profils = profil_model_1.profilModel.read();
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
    }
    getProfilByUserId(req, res) {
        const { userId } = req.params;
        try {
            const profils = profil_model_1.profilModel.read();
            const profil = profils.find((p) => p.userId === userId);
            if (!profil) {
                logger_util_1.default.warn("Profil not found by userId", { userId });
                const newProfil = {
                    userId,
                    avatarUrl: "",
                    nama_lengkap: "",
                    summary: "",
                };
                profil_model_1.profilModel.create(newProfil);
                logger_util_1.default.info("Profil created successfully for userId", { userId });
                const profils = profil_model_1.profilModel.read();
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
    }
    updateProfil(req, res) {
        const { id } = req.params;
        const profilData = req.body;
        try {
            // chekc if username already
            profil_model_1.profilModel.update(id, profilData);
            logger_util_1.default.info("Profil updated successfully", { id, profilData });
            res.status(200).json({ message: "Profil updated successfully." });
        }
        catch (error) {
            logger_util_1.default.error("Error in updateProfil", { id, error });
            res.status(400).json({ message: "Internal server error" });
        }
    }
    deleteProfil(req, res) {
        const { id } = req.params;
        try {
            profil_model_1.profilModel.delete(id);
            logger_util_1.default.info("Profil deleted successfully", { id });
            res.status(200).json({ message: "Profil deleted successfully." });
        }
        catch (error) {
            logger_util_1.default.error("Error in deleteProfil", { id, error });
            res.status(400).json({ message: "Internal server error" });
        }
    }
    uploadProfilePicture(req, res) {
        const { id } = req.params;
        try {
            const profil = profil_model_1.profilModel.search("id", "==", id);
            if (profil.length === 0) {
                logger_util_1.default.warn("Profil not found for uploadProfilePicture", { id });
                res.status(404).json({ message: "Profil not found." });
                return;
            }
            if (!req.files || !req.files.avatar) {
                logger_util_1.default.warn("No file uploaded for uploadProfilePicture", { id });
                res.status(400).json({ message: "No file uploaded." });
                return;
            }
            if (profil[0].avatarUrl !== "") {
                const existingAvatarPath = path_1.default.join(__dirname, "../../uploads", path_1.default.basename(profil[0].avatarUrl));
                if (fs_1.default.existsSync(existingAvatarPath)) {
                    fs_1.default.unlinkSync(existingAvatarPath);
                }
            }
            const avatar = req.files.avatar;
            const uploadPath = __dirname + "/../../uploads/" + avatar.name;
            avatar.mv(uploadPath, (err) => {
                if (err) {
                    logger_util_1.default.error("Failed to upload file", { id, error: err });
                    res.status(500).json({ message: "Failed to upload file." });
                    return;
                }
                const profilData = { avatarUrl: avatar.name };
                profil_model_1.profilModel.update(id, profilData);
                logger_util_1.default.info("Profile picture uploaded successfully", {
                    id,
                    avatarUrl: avatar.name,
                });
                res.status(200).json({
                    message: "Profile picture uploaded successfully.",
                });
            });
        }
        catch (error) {
            const uploadPath = __dirname + "/../../uploads/" + req.files.avatar.name;
            if (fs_1.default.existsSync(uploadPath)) {
                fs_1.default.unlinkSync(uploadPath);
            }
            logger_util_1.default.error("Failed to upload profile picture", { id, error });
            res.status(500).json({ message: "Failed to upload profile picture." });
        }
    }
    getProfilePicture(req, res) {
        const { id } = req.params;
        try {
            const profil = profil_model_1.profilModel.search("id", "==", id);
            if (profil.length === 0) {
                logger_util_1.default.warn("Profile picture not found", { id });
                res.status(404).json({ message: "Profile picture not found." });
                return;
            }
            if (profil[0].avatarUrl === "") {
                logger_util_1.default.warn("Profile picture not found", { id });
                const defaultAvatarPath = path_1.default.join(__dirname, "../../uploads/default-avatar.jpg");
                if (fs_1.default.existsSync(defaultAvatarPath)) {
                    res.status(200).sendFile(defaultAvatarPath);
                }
                else {
                    res
                        .status(404)
                        .json({ message: "Default profile picture not found." });
                }
                return;
            }
            const filePath = path_1.default.join(__dirname, "../../uploads", path_1.default.basename(profil[0].avatarUrl));
            logger_util_1.default.info("Profile picture retrieved successfully", { id });
            res.status(200).sendFile(filePath);
        }
        catch (error) {
            logger_util_1.default.error("Failed to retrieve profile picture", { id, error });
            res.status(500).json({ message: "Internal server error" });
        }
    }
    deleteProfilePicture(req, res) {
        const { id } = req.params;
        try {
            const profil = profil_model_1.profilModel.search("id", "==", id);
            if (profil.length === 0) {
                logger_util_1.default.warn("Profil not found for deleteProfilePicture", { id });
                res.status(404).json({ message: "Profil not found." });
                return;
            }
            if (profil[0].avatarUrl === "") {
                logger_util_1.default.warn("No profile picture to delete", { id });
                res.status(400).json({ message: "No profile picture to delete." });
                return;
            }
            const filePath = path_1.default.join(__dirname, "../../uploads", path_1.default.basename(profil[0].avatarUrl));
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
            }
            profil_model_1.profilModel.update(id, { avatarUrl: "" });
            logger_util_1.default.info("Profile picture deleted successfully", { id });
            res
                .status(200)
                .json({ message: "Profile picture deleted successfully." });
        }
        catch (error) {
            logger_util_1.default.error("Failed to delete profile picture", { id, error });
            res.status(500).json({ message: "Failed to delete profile picture." });
        }
    }
}
exports.default = ProfilController;
