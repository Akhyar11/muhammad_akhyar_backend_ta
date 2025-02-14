import { anthropometryModel } from "../antropomerty.model";
import { Request, Response } from "express";
import logger from "../../utils/logger.util"; // Import the logger
import { userModel } from "../../user/user.model";
import { groqCreateSummaryAnthropometry } from "../../groq/groq.service";
import { profilModel } from "../../profil/profil.model";

function calculateBMI(height: number, weight: number) {
  return `${weight / Math.pow(height / 100, 2)}`;
}

// Controller for anthropometry IoT
export default class AnthropometryIotController {
  // Get data from IoT
  async setData(req: Request, res: Response) {
    try {
      const { height, weight, notes, userId } = req.query;
      console.log({ height, weight, notes, userId });
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
      const user = userModel.search("id", "==", userId);
      if (!user || user.length === 0) {
        logger.warn("User not found in getData", { userId });
        res.status(404).json({ message: "User not found" });
        return;
      }

      // Calculate BMI
      const bmi = calculateBMI(Number(height), Number(weight));
      logger.info("Calculated BMI", { userId, height, weight, bmi });

      // Save data
      anthropometryModel.create({ userId, height, weight, bmi, date, notes });
      logger.info("Data saved successfully", {
        userId,
        height,
        weight,
        bmi,
        date,
        notes,
      });

      const summary = await groqCreateSummaryAnthropometry(userId as string)
      const profil = profilModel.search("userId", "==", userId)
      profilModel.update(profil[0].id, { summary })

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
      const user = userModel.search("userId", "==", userId);
      if (!user || user.length === 0) {
        logger.warn("User not found in getAccess", { userId });
        res.status(404).json({ message: "User not found" });
        return;
      }

      // Grant access
      userModel.update(userId as string, { ...user[0], iotIsAllowed: true });
      logger.info("Access granted to user", { userId });

      // Return response
      res.status(200).json({ message: "Access granted" });
    } catch (error) {
      logger.error("Failed to grant access in getAccess", { error });
      res.status(500).json({ message: "Internal server error" });
    }
  }
}
