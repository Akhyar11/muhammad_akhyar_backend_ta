import { Request, Response } from "express";
import { groqModel, GroqSchema } from "./groq.model";
import { validateData } from "../utils/validation.util";
import logger from "../utils/logger.util";

class GroqController {
  createGroq(req: Request, res: Response) {
    try {
      const groqData = req.body;
      
      const validationResult = validateData(GroqSchema, groqData);
      if (validationResult !== true) {
        logger.warn("Validation failed for createGroq", { validationResult });
        res.status(400).json(validationResult);
        return;
      }

      groqModel.create(groqData);
      logger.info("Groq created successfully", { groqData });
      res.status(201).json({ message: "Groq created successfully." });
    } catch (error) {
      logger.error("Error in createGroq", { error });
      res.status(500).json({ message: "Internal server error" });
    }
  }

  getAllGroqs(req: Request, res: Response) {
    try {
      const groqs = groqModel.read();
      logger.info("Retrieved all groqs", { count: groqs.length });
      res.status(200).json(groqs);
    } catch (error) {
      logger.error("Failed to retrieve groqs", { error });
      res.status(500).json({ message: "Failed to retrieve groqs." });
    }
  }

  getGroqById(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const groqs = groqModel.read();
      const groq = groqs.find((g) => g.id === id);
      if (!groq) {
        logger.warn("Groq not found", { id });
        res.status(404).json({ message: "Groq not found." });
        return;
      }
      logger.info("Retrieved groq by ID", { id });
      res.status(200).json(groq);
    } catch (error) {
      logger.error("Failed to retrieve groq by ID", { id, error });
      res.status(500).json({ message: "Failed to retrieve groq." });
    }
  }

  updateGroq(req: Request, res: Response) {
    const { id } = req.params;
    const groqData = req.body;

    try {
      const groqs = groqModel.read();
      const groq = groqs.find((g) => g.id === id);
      if (!groq) {
        logger.warn("Groq not found for update", { id });
        res.status(404).json({ message: "Groq not found." });
        return;
      }

      groqModel.update(id, groqData);
      logger.info("Groq updated successfully", { id, groqData });
      res.status(200).json({ message: "Groq updated successfully." });
    } catch (error) {
      logger.error("Error in updateGroq", { id, error });
      res.status(500).json({ message: "Internal server error" });
    }
  }

  deleteGroq(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const groqs = groqModel.read();
      const groq = groqs.find((g) => g.id === id);
      if (!groq) {
        logger.warn("Groq not found for deletion", { id });
        res.status(404).json({ message: "Groq not found." });
        return;
      }

      groqModel.delete(id);
      logger.info("Groq deleted successfully", { id });
      res.status(200).json({ message: "Groq deleted successfully." });
    } catch (error) {
      logger.error("Error in deleteGroq", { id, error });
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default GroqController;
