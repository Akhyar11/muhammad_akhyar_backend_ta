import { Request, Response } from "express";
import { anthropometryModel } from "./antropomerty.model";
import logger from "../utils/logger.util"; // Import the logger

export default class AnthropometryController {
  // Get all anthropometry data by user ID
  async getAllById(req: Request, res: Response): Promise<void> {
    try {
      // Get id from request
      const { id } = req.params;
      const { periode_awal, periode_akhir } = req.query;

      // Log the request for data retrieval
      logger.info("Retrieving anthropometry data for user ID", { userId: id });

      // Get all anthropometry data by id
      let data = anthropometryModel.advancedSearch({
        field: "userId",
        operator: "==",
        value: id,
        withOutFields: ["userId"],
      });

      if (periode_akhir && periode_awal) {
        data = data.filter((item) => {
          const tanggal = new Date(item.date);
          return tanggal >= new Date(periode_awal as string) && tanggal <= new Date(periode_akhir as string);
        });
      }

      // Check if data is empty
      if (data.length === 0) {
        logger.warn("No anthropometry data found for user ID", { userId: id });
        res.status(200).json({ data: [] });
        return;
      }

      logger.info("Successfully retrieved anthropometry data", {
        userId: id,
        dataCount: data.length,
      });
      res.status(200).json({ data });
    } catch (error) {
      logger.error("Failed to get anthropometry data", { error });
      res.status(500).json({ message: "Failed to get anthropometry data" });
    }
  }
}
