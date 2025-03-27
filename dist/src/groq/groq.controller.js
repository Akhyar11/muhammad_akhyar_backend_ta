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
const groq_model_1 = require("./groq.model");
const groq_service_1 = require("./groq.service");
const logger_util_1 = __importDefault(require("../utils/logger.util"));
class GroqController {
    /**
     * Handles the creation of a new conversation entry and generates a response from Groq.
     *
     * @param req - Express request object containing user input.
     * @param res - Express response object to send the response back to the client.
     */
    createConvertation(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, userMessage } = req.body;
                // Validate input
                if (!userId || !userMessage) {
                    res.status(400).json({ error: "userId and userMessage are required" });
                }
                // Fetch the last 3 conversations for the given userId
                const previousConversations = (yield groq_model_1.convertationModel.search("userId", "==", userId)).slice(-3);
                // Construct the prompt with previous conversations
                let prompt = "Gunakan bahasa indonesia\n";
                previousConversations.forEach((conv, index) => {
                    prompt += `Percakapan ${index + 1}:\n`;
                    prompt += `User: ${conv.userMessage}\n`;
                    prompt += `AI: ${conv.AIMessage}\n\n`;
                });
                prompt += `Percakapan saat ini:\n`;
                prompt += `User: ${userMessage}\n`;
                // Get response from Groq
                const groqResponse = yield groq_service_1.groqService.getGroqResponse(prompt);
                const AIMessage = groqResponse;
                // Create a new convertation entry
                const newConvertation = {
                    userId: userId,
                    userMessage: userMessage,
                    AIMessage: AIMessage,
                };
                groq_model_1.convertationModel.create(newConvertation);
                // Send response back to the client
                res.status(200).json({
                    userMessage: userMessage,
                    AIMessage: AIMessage,
                });
            }
            catch (error) {
                logger_util_1.default.error("Error in createConvertation:", error);
                res.status(500).json({ error: "Internal Server Error" });
            }
        });
    }
    /**
     * Retrieves conversation entries for a given userId, ordered from newest to oldest.
     *
     * @param req - Express request object containing query parameters.
     * @param res - Express response object to send the response back to the client.
     */
    getConvertation(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, limit } = req.query;
                // Validate input
                if (!userId) {
                    res.status(400).json({ error: "userId is required" });
                }
                // Parse limit to number, default to 10 if not provided or invalid
                const parsedLimit = typeof limit === "string" ? parseInt(limit, 10) : 10;
                const validLimit = isNaN(parsedLimit) ? 10 : parsedLimit;
                // Fetch conversations for the given userId, ordered from newest to oldest
                const conversations = (yield groq_model_1.convertationModel.search("userId", "==", userId))
                    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                    .slice(0, validLimit);
                // Send response back to the client
                res.status(200).json(conversations);
            }
            catch (error) {
                logger_util_1.default.error("Error in getConvertation:", error);
                res.status(500).json({ error: "Internal Server Error" });
            }
        });
    }
}
exports.default = GroqController;
