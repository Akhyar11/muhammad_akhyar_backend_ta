import { Request, Response } from "express";
import { profilModel, ProfilSchema } from "./profil.model";
import { userModel } from "../user/user.model";
import { validateData } from "../utils/validation.util";
import path from "path";
import fs from "fs";
import logger from "../utils/logger.util";

class ProfilController {
  createProfil(req: Request, res: Response) {
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

      const user = userModel.search("id", "==", profilData.userId);
      if (user.length === 0) {
        logger.warn("User not found for createProfil", {
          userId: profilData.userId,
        });
        res.status(404).json({ message: "User not found." });
        return;
      }

      profilModel.create(profilData);
      logger.info("Profil created successfully", { profilData });
      res.status(201).json({ message: "Profil created successfully." });
    } catch (error) {
      logger.error("Error in createProfil", { error });
      res.status(400).json({ message: "Internal server error" });
    }
  }

  getAllProfils(req: Request, res: Response) {
    try {
      const profils = profilModel.read();
      logger.info("Retrieved all profils", { count: profils.length });
      res.status(200).json(profils);
    } catch (error) {
      logger.error("Failed to retrieve profils", { error });
      res.status(500).json({ message: "Failed to retrieve profils." });
    }
  }

  getProfilById(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const profils = profilModel.read();
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

  getProfilByUserId(req: Request, res: Response) {
    const { userId } = req.params;
    try {
      const profils = profilModel.read();
      const profil = profils.find((p) => p.userId === userId);
      if (!profil) {
        logger.warn("Profil not found by userId", { userId });
        const newProfil = {
          userId,
          avatarUrl: "",
          nama_lengkap: "",
          summary: "",
        };
        profilModel.create(newProfil);
        logger.info("Profil created successfully for userId", { userId });
        const profils = profilModel.read();
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

  updateProfil(req: Request, res: Response) {
    const { id } = req.params;
    const profilData = req.body;

    try {
      // chekc if username already

      profilModel.update(id, profilData);
      logger.info("Profil updated successfully", { id, profilData });
      res.status(200).json({ message: "Profil updated successfully." });
    } catch (error) {
      logger.error("Error in updateProfil", { id, error });
      res.status(400).json({ message: "Internal server error" });
    }
  }

  deleteProfil(req: Request, res: Response) {
    const { id } = req.params;
    try {
      profilModel.delete(id);
      logger.info("Profil deleted successfully", { id });
      res.status(200).json({ message: "Profil deleted successfully." });
    } catch (error) {
      logger.error("Error in deleteProfil", { id, error });
      res.status(400).json({ message: "Internal server error" });
    }
  }

  uploadProfilePicture(req: any, res: any) {
    const { id } = req.params;
    try {
      const profil = profilModel.search("id", "==", id);
      if (profil.length === 0) {
        logger.warn("Profil not found for uploadProfilePicture", { id });
        res.status(404).json({ message: "Profil not found." });
        return;
      }

      if (!req.files || !req.files.avatar) {
        logger.warn("No file uploaded for uploadProfilePicture", { id });
        res.status(400).json({ message: "No file uploaded." });
        return;
      }

      if (profil[0].avatarUrl !== "") {
        const existingAvatarPath = path.join(
          __dirname,
          "../../uploads",
          path.basename(profil[0].avatarUrl)
        );
        if (fs.existsSync(existingAvatarPath)) {
          fs.unlinkSync(existingAvatarPath);
        }
      }

      const avatar = req.files.avatar;
      const uploadPath = __dirname + "/../../tmp/uploads/" + avatar.name;

      avatar.mv(uploadPath, (err: any) => {
        if (err) {
          logger.error("Failed to upload file", { id, error: err });
          res.status(500).json({ message: "Failed to upload file." });
          return;
        }

        const profilData = { avatarUrl: avatar.name };
        profilModel.update(id, profilData);

        logger.info("Profile picture uploaded successfully", {
          id,
          avatarUrl: avatar.name,
        });
        res.status(200).json({
          message: "Profile picture uploaded successfully.",
        });
      });
    } catch (error) {
      const uploadPath =
        __dirname + "/../../tmp/uploads/" + req.files.avatar.name;
      if (fs.existsSync(uploadPath)) {
        fs.unlinkSync(uploadPath);
      }

      logger.error("Failed to upload profile picture", { id, error });
      res.status(500).json({ message: "Failed to upload profile picture." });
    }
  }

  getProfilePicture(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const profil = profilModel.search("id", "==", id);

      if (profil.length === 0) {
        logger.warn("Profile picture not found", { id });
        res.status(404).json({ message: "Profile picture not found." });
        return;
      }

      if (profil[0].avatarUrl === "") {
        logger.warn("Profile picture not found", { id });
        const defaultAvatarPath = path.join(
          __dirname,
          "../../tmp/uploads/default-avatar.jpg"
        );
        if (fs.existsSync(defaultAvatarPath)) {
          res.status(200).sendFile(defaultAvatarPath);
        } else {
          res
            .status(404)
            .json({ message: "Default profile picture not found." });
        }
        return;
      }

      const filePath = path.join(
        __dirname,
        "../../uploads",
        path.basename(profil[0].avatarUrl)
      );

      logger.info("Profile picture retrieved successfully", { id });
      res.status(200).sendFile(filePath);
    } catch (error) {
      logger.error("Failed to retrieve profile picture", { id, error });
      res.status(500).json({ message: "Internal server error" });
    }
  }

  deleteProfilePicture(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const profil = profilModel.search("id", "==", id);
      if (profil.length === 0) {
        logger.warn("Profil not found for deleteProfilePicture", { id });
        res.status(404).json({ message: "Profil not found." });
        return;
      }

      if (profil[0].avatarUrl === "") {
        logger.warn("No profile picture to delete", { id });
        res.status(400).json({ message: "No profile picture to delete." });
        return;
      }

      const filePath = path.join(
        __dirname,
        "../../uploads",
        path.basename(profil[0].avatarUrl)
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      profilModel.update(id, { avatarUrl: "" });

      logger.info("Profile picture deleted successfully", { id });
      res
        .status(200)
        .json({ message: "Profile picture deleted successfully." });
    } catch (error) {
      logger.error("Failed to delete profile picture", { id, error });
      res.status(500).json({ message: "Failed to delete profile picture." });
    }
  }
}

export default ProfilController;
