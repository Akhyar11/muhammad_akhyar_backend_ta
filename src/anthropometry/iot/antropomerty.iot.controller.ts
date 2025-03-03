import { anthropometryModel } from "../antropomerty.model";
import { Request, Response } from "express";
import logger from "../../utils/logger.util"; // Import the logger
import { userModel } from "../../user/user.model";
import { groqCreateSummaryAnthropometry } from "../../groq/groq.service";
import { profilModel } from "../../profil/profil.model";

function calculateBMI(height: number, weight: number) {
  return `${weight / Math.pow(height / 100, 2)}`;
}

// Calculate age from date at format {age: number, months: number}
function calculateAge(birthDate: Date) {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();

  if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
    age--;
    months += 12;
  }

  if (today.getDate() < birthDate.getDate()) {
    months--;
  }

  return { age, months };
}

/**
 * Calculate KMS (Kartu Menuju Sehat) status for a child
 * @param {number} ageInMonths - Child's age in months
 * @param {number} weightInKg - Child's weight in kilograms
 * @param {string} gender - Child's gender ('male' or 'female')
 * @returns {string} - Nutritional status ('Normal', 'Underweight', 'Severely Underweight', 'Overweight', or 'Unknown')
 */
function calculateKMSStatus(
  ageInMonths: number,
  weightInKg: number,
  gender: string
) {
  // KMS reference data for boys (age in months, weight in kg)
  const kmsReferenceBoy = {
    // -3SD (severely underweight)
    severelyUnderweight: [
      { age: 0, weight: 2.1 },
      { age: 2, weight: 3.4 },
      { age: 4, weight: 4.4 },
      { age: 6, weight: 5.3 },
      { age: 8, weight: 6.0 },
      { age: 10, weight: 6.6 },
      { age: 12, weight: 7.1 },
      { age: 24, weight: 9.0 },
      { age: 36, weight: 10.8 },
      { age: 48, weight: 12.2 },
      { age: 60, weight: 13.7 },
    ],
    // -2SD (underweight)
    underweight: [
      { age: 0, weight: 2.5 },
      { age: 2, weight: 4.3 },
      { age: 4, weight: 5.6 },
      { age: 6, weight: 6.4 },
      { age: 8, weight: 7.1 },
      { age: 10, weight: 7.7 },
      { age: 12, weight: 8.3 },
      { age: 24, weight: 10.5 },
      { age: 36, weight: 12.7 },
      { age: 48, weight: 14.3 },
      { age: 60, weight: 16.0 },
    ],
    // Median
    normal: [
      { age: 0, weight: 3.3 },
      { age: 2, weight: 5.5 },
      { age: 4, weight: 7.0 },
      { age: 6, weight: 7.9 },
      { age: 8, weight: 8.7 },
      { age: 10, weight: 9.4 },
      { age: 12, weight: 10.0 },
      { age: 24, weight: 12.4 },
      { age: 36, weight: 14.6 },
      { age: 48, weight: 16.7 },
      { age: 60, weight: 18.7 },
    ],
    // +2SD (overweight)
    overweight: [
      { age: 0, weight: 4.2 },
      { age: 2, weight: 7.0 },
      { age: 4, weight: 8.6 },
      { age: 6, weight: 9.8 },
      { age: 8, weight: 10.7 },
      { age: 10, weight: 11.6 },
      { age: 12, weight: 12.4 },
      { age: 24, weight: 15.0 },
      { age: 36, weight: 17.4 },
      { age: 48, weight: 19.8 },
      { age: 60, weight: 22.4 },
    ],
  };

  // KMS reference data for girls (age in months, weight in kg)
  const kmsReferenceGirl = {
    // -3SD (severely underweight)
    severelyUnderweight: [
      { age: 0, weight: 2.0 },
      { age: 2, weight: 3.2 },
      { age: 4, weight: 4.2 },
      { age: 6, weight: 4.9 },
      { age: 8, weight: 5.5 },
      { age: 10, weight: 6.0 },
      { age: 12, weight: 6.5 },
      { age: 24, weight: 8.5 },
      { age: 36, weight: 10.2 },
      { age: 48, weight: 11.7 },
      { age: 60, weight: 13.0 },
    ],
    // -2SD (underweight)
    underweight: [
      { age: 0, weight: 2.4 },
      { age: 2, weight: 3.9 },
      { age: 4, weight: 5.1 },
      { age: 6, weight: 5.9 },
      { age: 8, weight: 6.6 },
      { age: 10, weight: 7.2 },
      { age: 12, weight: 7.7 },
      { age: 24, weight: 9.9 },
      { age: 36, weight: 11.9 },
      { age: 48, weight: 13.5 },
      { age: 60, weight: 15.1 },
    ],
    // Median
    normal: [
      { age: 0, weight: 3.2 },
      { age: 2, weight: 5.0 },
      { age: 4, weight: 6.4 },
      { age: 6, weight: 7.3 },
      { age: 8, weight: 8.0 },
      { age: 10, weight: 8.7 },
      { age: 12, weight: 9.3 },
      { age: 24, weight: 11.8 },
      { age: 36, weight: 14.1 },
      { age: 48, weight: 16.1 },
      { age: 60, weight: 18.0 },
    ],
    // +2SD (overweight)
    overweight: [
      { age: 0, weight: 4.2 },
      { age: 2, weight: 6.5 },
      { age: 4, weight: 8.1 },
      { age: 6, weight: 9.3 },
      { age: 8, weight: 10.2 },
      { age: 10, weight: 11.0 },
      { age: 12, weight: 11.7 },
      { age: 24, weight: 14.4 },
      { age: 36, weight: 16.9 },
      { age: 48, weight: 19.4 },
      { age: 60, weight: 21.7 },
    ],
  };

  // Select reference data based on gender
  const referenceData =
    gender.toLowerCase() === "male" ? kmsReferenceBoy : kmsReferenceGirl;

  // Find the closest age index in the reference data
  // If exact age isn't in the data, find the first age that's greater than or equal to child's age
  const closestAgeIndex = referenceData.normal.findIndex(
    (data) => data.age >= ageInMonths
  );

  // If child's age is beyond the reference data, return Unknown
  if (closestAgeIndex === -1) return "Unknown";

  // If child's age is between two reference points, use linear interpolation
  let severelyUnderweightThreshold, underweightThreshold, overweightThreshold;

  // Get the exact or next higher age reference point
  const exactMatchAge =
    referenceData.normal[closestAgeIndex].age === ageInMonths;

  if (exactMatchAge || closestAgeIndex === 0) {
    // If exact age match or it's the first entry, use direct values
    severelyUnderweightThreshold =
      referenceData.severelyUnderweight[closestAgeIndex].weight;
    underweightThreshold = referenceData.underweight[closestAgeIndex].weight;
    overweightThreshold = referenceData.overweight[closestAgeIndex].weight;
  } else {
    // Use linear interpolation between the two closest age points
    const lowerIndex = closestAgeIndex - 1;
    const upperIndex = closestAgeIndex;

    const lowerAge = referenceData.normal[lowerIndex].age;
    const upperAge = referenceData.normal[upperIndex].age;

    // Calculate position between lower and upper age (0-1)
    const ageRatio = (ageInMonths - lowerAge) / (upperAge - lowerAge);

    // Interpolate thresholds
    severelyUnderweightThreshold = interpolateWeight(
      referenceData.severelyUnderweight[lowerIndex].weight,
      referenceData.severelyUnderweight[upperIndex].weight,
      ageRatio
    );

    underweightThreshold = interpolateWeight(
      referenceData.underweight[lowerIndex].weight,
      referenceData.underweight[upperIndex].weight,
      ageRatio
    );

    overweightThreshold = interpolateWeight(
      referenceData.overweight[lowerIndex].weight,
      referenceData.overweight[upperIndex].weight,
      ageRatio
    );
  }

  // Determine status based on weight thresholds
  if (weightInKg < severelyUnderweightThreshold) return "Severely Underweight";
  if (weightInKg < underweightThreshold) return "Underweight";
  if (weightInKg > overweightThreshold) return "Overweight";
  return "Normal";
}

/**
 * Helper function to interpolate weight between two reference points
 */
function interpolateWeight(weight1: number, weight2: number, ratio: number) {
  return weight1 + (weight2 - weight1) * ratio;
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

      const ages = calculateAge(new Date(user[0].tgl_lahir));
      const gender = user[0].jk ? "male" : "female";
      let bmi = "";
      let ksm = "";

      // Calculate BMI
      if (ages.age > 5) {
        bmi = calculateBMI(Number(height), Number(weight));
        logger.info("Calculated BMI", { userId, height, weight, bmi });
      } else {
        ksm = calculateKMSStatus(ages.age, Number(weight), gender);
      }

      // Save data
      anthropometryModel.create({
        userId,
        height,
        weight,
        bmi,
        date,
        notes,
        ksm,
      });
      logger.info("Data saved successfully", {
        userId,
        height,
        weight,
        bmi,
        date,
        notes,
      });

      const summary = await groqCreateSummaryAnthropometry(userId as string);
      const profil = profilModel.search("userId", "==", userId);
      if (profil.length === 0) {
        profilModel.create({
          userId,
          nama_lengkap: "",
          avatarUrl: "",
          summary,
        });
      } else {
        profilModel.update(profil[0].id, { summary });
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
