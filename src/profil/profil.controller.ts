import { Request, Response } from "express";
import { profilModel, ProfilSchema } from "./profil.model";
import { userModel } from "../user/user.model";
import { validateData } from "../utils/validation.util";
import path from "path";
import fs from "fs";
import logger from "../utils/logger.util";
import {
  deleteFileFromDrive,
  getFileFromDrive,
  uploadBufferToDrive,
} from "../utils/google.drive.util";

class ProfilController {
  async createProfil(req: Request, res: Response) {
    try {
      const profilData = req.body;
      profilData.avatarUrl = "";
      profilData.summary = "";

      const validationResult = validateData(ProfilSchema, profilData);
      if (validationResult !== true) {
        logger.warn("Validation failed for createProfil", { validationResult });
        res.status(400).json(validationResult);
        return;
      }

      const user = await userModel.search("id", "==", profilData.userId);
      if (user.length === 0) {
        logger.warn("User not found for createProfil", {
          userId: profilData.userId,
        });
        res.status(404).json({ message: "User not found." });
        return;
      }

      await profilModel.create(profilData);
      logger.info("Profil created successfully", { profilData });
      res.status(201).json({ message: "Profil created successfully." });
    } catch (error) {
      logger.error("Error in createProfil", { error });
      res.status(400).json({ message: "Internal server error" });
    }
  }

  async getAllProfils(req: Request, res: Response) {
    try {
      const profils = await profilModel.read();
      logger.info("Retrieved all profils", { count: profils.length });
      res.status(200).json(profils);
    } catch (error) {
      logger.error("Failed to retrieve profils", { error });
      res.status(500).json({ message: "Failed to retrieve profils." });
    }
  }

  async getProfilById(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const profils = await profilModel.read();
      const profil = profils.find((p) => p.id === id);
      if (!profil) {
        logger.warn("Profil not found", { id });
        res.status(404).json({ message: "Profil not found." });
        return;
      }
      logger.info("Retrieved profil by ID", { id });
      res.status(200).json(profil);
    } catch (error) {
      logger.error("Failed to retrieve profil by ID", { id, error });
      res.status(500).json({ message: "Failed to retrieve profil." });
    }
  }

  async getProfilByUserId(req: Request, res: Response) {
    const { userId } = req.params;
    try {
      const profils = await profilModel.read();
      const profil = profils.find((p) => p.userId === userId);
      if (!profil) {
        logger.warn("Profil not found by userId", { userId });
        const newProfil = {
          userId,
          avatarUrl: "",
          avatarFileId: "", // Tambahkan field untuk menyimpan fileId dari Google Drive
          nama_lengkap: "",
          summary: "",
        };
        await profilModel.create(newProfil);
        logger.info("Profil created successfully for userId", { userId });
        const profils = await profilModel.read();
        const profil = profils.find((p) => p.userId === userId);
        res.status(200).json(profil);
        return;
      }
      logger.info("Retrieved profil by userId", { userId });
      res.status(200).json(profil);
    } catch (error) {
      logger.error("Failed to retrieve profil by userId", { userId, error });
      res.status(500).json({ message: "Failed to retrieve profil." });
    }
  }

  async updateProfil(req: Request, res: Response) {
    const { id } = req.params;
    const profilData = req.body;

    try {
      const profils = await profilModel.search("userId", "==", id);
      if (!profils[0]) {
        logger.warn("Profil not found for updateProfil", { id });
        res.status(404).json({ message: "Profil not found." });
        return;
      }

      await profilModel.update(profils[0].id, profilData);
      logger.info("Profil updated successfully", { id, profilData });
      res.status(200).json({ message: "Profil updated successfully." });
    } catch (error) {
      logger.error("Error in updateProfil", { id, error });
      res.status(400).json({ message: "Internal server error" });
    }
  }

  async deleteProfil(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await profilModel.delete(id);
      logger.info("Profil deleted successfully", { id });
      res.status(200).json({ message: "Profil deleted successfully." });
    } catch (error) {
      logger.error("Error in deleteProfil", { id, error });
      res.status(400).json({ message: "Internal server error" });
    }
  }

  async uploadProfilePicture(req: any, res: Response) {
    try {
      const { id } = req.params;

      // Pastikan file ada dalam request
      if (!req.file) {
        res.status(400).json({ message: "No file uploaded" });
        return;
      }

      // Dapatkan data profil
      const profils = await profilModel.search("id", "==", id);
      const profil = profils[0];
      if (!profil) {
        res.status(404).json({ message: "Profil not found" });
        return;
      }

      // Jika sudah ada foto profil sebelumnya, hapus dari Google Drive
      if (profil.avatarFileId) {
        try {
          await deleteFileFromDrive(profil.avatarFileId);
        } catch (error) {
          logger.warn("Failed to delete previous profile picture", {
            id,
            error,
          });
        }
      }

      // Upload file baru ke Google Drive
      const fileName = `profile_${id}_${Date.now()}${req.file.originalname.substring(
        req.file.originalname.lastIndexOf(".")
      )}`;
      const { fileId, webContentLink } = await uploadBufferToDrive(
        req.file.buffer,
        fileName,
        req.file.mimetype
      );

      // Update data profil dengan URL dan fileId baru
      await profilModel.update(id, {
        avatarUrl: webContentLink,
        avatarFileId: fileId,
      });

      logger.info("Profile picture uploaded successfully", { id });
      res.status(200).json({
        message: "Profile picture uploaded successfully",
        avatarUrl: webContentLink,
      });
      return;
    } catch (error) {
      logger.error("Failed to upload profile picture", { error });
      res.status(500).json({ message: "Failed to upload profile picture" });
      return;
    }
  }

  async getProfilePicture(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Dapatkan data profil
      const profils = await profilModel.search("id", "==", id);
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
      const fileBuffer = await getFileFromDrive(profil.avatarFileId);

      // Tentukan tipe konten berdasarkan ekstensi file atau default ke image/jpeg
      const fileExtension = profil.avatarUrl
        .substring(profil.avatarUrl.lastIndexOf(".") + 1)
        .toLowerCase();
      let contentType = "image/jpeg"; // Default

      if (fileExtension === "png") contentType = "image/png";
      else if (fileExtension === "gif") contentType = "image/gif";
      else if (fileExtension === "webp") contentType = "image/webp";

      // Kirim file sebagai response
      res.setHeader("Content-Type", contentType);
      res.send(fileBuffer);
      return;
    } catch (error) {
      logger.error("Failed to get profile picture", { error });
      res.status(500).json({ message: "Failed to get profile picture" });
      return;
    }
  }

  async deleteProfilePicture(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Dapatkan data profil
      const profils = await profilModel.search("id", "==", id);
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
      await deleteFileFromDrive(profil.avatarFileId);

      // Update data profil
      await profilModel.update(id, {
        avatarUrl: "",
        avatarFileId: "",
      });

      logger.info("Profile picture deleted successfully", { id });
      res.status(200).json({ message: "Profile picture deleted successfully" });
      return;
    } catch (error) {
      logger.error("Failed to delete profile picture", { error });
      res.status(500).json({ message: "Failed to delete profile picture" });
      return;
    }
  }
}

export default ProfilController;
