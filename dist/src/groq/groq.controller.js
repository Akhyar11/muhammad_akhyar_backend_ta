"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const groq_model_1 = require("./groq.model");
const validation_util_1 = require("../utils/validation.util");
const logger_util_1 = __importDefault(require("../utils/logger.util"));
class GroqController {
    createGroq(req, res) {
        try {
            const groqData = req.body;
            const validationResult = (0, validation_util_1.validateData)(groq_model_1.GroqSchema, groqData);
            if (validationResult !== true) {
                logger_util_1.default.warn("Validation failed for createGroq", { validationResult });
                res.status(400).json(validationResult);
                return;
            }
            groq_model_1.groqModel.create(groqData);
            logger_util_1.default.info("Groq created successfully", { groqData });
            res.status(201).json({ message: "Groq created successfully." });
        }
        catch (error) {
            logger_util_1.default.error("Error in createGroq", { error });
            res.status(500).json({ message: "Internal server error" });
        }
    }
    getAllGroqs(req, res) {
        try {
            const groqs = groq_model_1.groqModel.read();
            logger_util_1.default.info("Retrieved all groqs", { count: groqs.length });
            res.status(200).json(groqs);
        }
        catch (error) {
            logger_util_1.default.error("Failed to retrieve groqs", { error });
            res.status(500).json({ message: "Failed to retrieve groqs." });
        }
    }
    getGroqById(req, res) {
        const { id } = req.params;
        try {
            const groqs = groq_model_1.groqModel.read();
            const groq = groqs.find((g) => g.id === id);
            if (!groq) {
                logger_util_1.default.warn("Groq not found", { id });
                res.status(404).json({ message: "Groq not found." });
                return;
            }
            logger_util_1.default.info("Retrieved groq by ID", { id });
            res.status(200).json(groq);
        }
        catch (error) {
            logger_util_1.default.error("Failed to retrieve groq by ID", { id, error });
            res.status(500).json({ message: "Failed to retrieve groq." });
        }
    }
    updateGroq(req, res) {
        const { id } = req.params;
        const groqData = req.body;
        try {
            const groqs = groq_model_1.groqModel.read();
            const groq = groqs.find((g) => g.id === id);
            if (!groq) {
                logger_util_1.default.warn("Groq not found for update", { id });
                res.status(404).json({ message: "Groq not found." });
                return;
            }
            groq_model_1.groqModel.update(id, groqData);
            logger_util_1.default.info("Groq updated successfully", { id, groqData });
            res.status(200).json({ message: "Groq updated successfully." });
        }
        catch (error) {
            logger_util_1.default.error("Error in updateGroq", { id, error });
            res.status(500).json({ message: "Internal server error" });
        }
    }
    deleteGroq(req, res) {
        const { id } = req.params;
        try {
            const groqs = groq_model_1.groqModel.read();
            const groq = groqs.find((g) => g.id === id);
            if (!groq) {
                logger_util_1.default.warn("Groq not found for deletion", { id });
                res.status(404).json({ message: "Groq not found." });
                return;
            }
            groq_model_1.groqModel.delete(id);
            logger_util_1.default.info("Groq deleted successfully", { id });
            res.status(200).json({ message: "Groq deleted successfully." });
        }
        catch (error) {
            logger_util_1.default.error("Error in deleteGroq", { id, error });
            res.status(500).json({ message: "Internal server error" });
        }
    }
}
exports.default = GroqController;
