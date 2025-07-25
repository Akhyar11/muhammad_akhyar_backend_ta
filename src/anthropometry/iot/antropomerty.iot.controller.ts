import { anthropometryModel } from "../antropomerty.model";
import { Request, Response } from "express";
import logger from "../../utils/logger.util"; // Import the logger
import { userModel } from "../../user/user.model";
import {
  groqCreateSummaryAIAPI,
  groqCreateSummaryAnthropometry,
  groqCreateSummaryAPI,
  groqCreateSummaryKMS,
} from "../../groq/groq.service";
import { profilModel } from "../../profil/profil.model";
import {
  calculateAge,
  calculateBMI,
  calculateHeightStatus,
  calculateKMSStatus,
} from "../../utils";

// Controller for anthropometry IoT
export default class AnthropometryIotController {
  async summary(req: Request, res: Response) {
    try {
      const { promnt } = req.body;

      console.log(promnt);
      let summary = await groqCreateSummaryAPI(promnt);

      res.status(200).json({ summary });
    } catch (error) {
      console.log(error);
      logger.error("Failed to save data in getData", { error });
      res.status(500).json({ message: "Internal server error", error });
    }
  }

  async summaryAI(req: Request, res: Response) {
    try {
      const { message } = req.body;

      // console.log(promnt);
      let summary = await groqCreateSummaryAIAPI(message);

      res.status(200).json({ summary });
    } catch (error) {
      console.log(error);
      logger.error("Failed to save data in getData", { error });
      res.status(500).json({ message: "Internal server error", error });
    }
  }

  // Get data from IoT
  async setData(req: Request, res: Response) {
    try {
      const { height, weight, notes, userId } = req.query;
      const date = new Date().toString();

      // Validate data
      if (!height || !weight) {
        logger.warn("Missing required fields in getData", {
          userId,
          height,
          weight,
        });

        res.status(400).json({ message: "Missing required fields" });
        return;
      }

      // Check if user exists
      const user = await userModel.search("id", "==", userId);
      if (!user || user.length === 0) {
        logger.warn("User not found in getData", { userId });
        res.status(404).json({ message: "User not found" });
        return;
      }

      const ageData = calculateAge(new Date(user[0].tgl_lahir));
      const gender = user[0].jk ? "male" : "female";

      let anthropometryData: any = {
        userId,
        height,
        weight,
        date,
        notes,
        age: ageData.age,
        months: ageData.months,
      };

      // For children under 5 years old, use KMS
      if (ageData.age < 5) {
        const kms_bb = calculateKMSStatus(
          ageData.age * 12 + ageData.months,
          Number(weight),
          gender
        );
        const kms_tb = calculateHeightStatus(
          ageData.age * 12 + ageData.months,
          Number(height),
          gender
        );
        anthropometryData = {
          ...anthropometryData,
          kms_bb,
          kms_tb,
          bmi: "",
        };
        logger.info("Calculated KMS status", { userId, kms_bb, kms_tb });
      }
      // For people 5 years and older, use BMI
      else {
        const bmi = calculateBMI(Number(height), Number(weight));
        anthropometryData = {
          ...anthropometryData,
          bmi,
          kms_bb: "",
          kms_tb: "",
        };
        logger.info("Calculated BMI", { userId, bmi });
      }

      // Save data
      anthropometryModel.create(anthropometryData);
      logger.info("Data saved successfully", anthropometryData);

      // Update profile summary
      let summary = "";
      if (ageData.age < 5) {
        summary = await groqCreateSummaryAnthropometry(userId as string);
      } else {
        summary = await groqCreateSummaryKMS(userId as string);
      }
      const profil = await profilModel.search("userId", "==", userId);
      if (!profil[0]) {
        await profilModel.create({
          userId,
          nama_lengkap: "",
          avatarUrl: "",
          summary,
        });
      } else {
        await profilModel.update(profil[0].id, { summary });
      }

      // Return response
      res.status(200).json({ message: "Data saved successfully" });
    } catch (error) {
      console.log(error);
      logger.error("Failed to save data in getData", { error });
      res.status(500).json({ message: "Internal server error" });
    }
  }

  // Get allowed access to IoT
  async getAccess(req: Request, res: Response) {
    try {
      const { userId } = req.query;

      // Check if user exists
      const user = await userModel.search("userId", "==", userId);
      if (!user || user.length === 0) {
        logger.warn("User not found in getAccess", { userId });
        res.status(404).json({ message: "User not found" });
        return;
      }

      // Grant access
      await userModel.update(userId as string, {
        ...user[0],
        iotIsAllowed: true,
      });
      logger.info("Access granted to user", { userId });

      // Return response
      res.status(200).json({ message: "Access granted" });
    } catch (error) {
      logger.error("Failed to grant access in getAccess", { error });
      res.status(500).json({ message: "Internal server error" });
    }
  }
}
