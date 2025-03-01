import { Request, Response } from "express";
import { convertationModel } from "./groq.model";
import { groqService } from "./groq.service";
import logger from "../utils/logger.util";

export default class GroqController {
  /**
   * Handles the creation of a new conversation entry and generates a response from Groq.
   *
   * @param req - Express request object containing user input.
   * @param res - Express response object to send the response back to the client.
   */
  async createConvertation(req: Request, res: Response) {
    try {
      const { userId, userMessage } = req.body;
      // Validate input
      if (!userId || !userMessage) {
        res.status(400).json({ error: "userId and userMessage are required" });
      }
      // Fetch the last 3 conversations for the given userId
      const previousConversations = convertationModel
        .search("userId", "==", userId)
        .slice(-3);
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
      const groqResponse = await groqService.getGroqResponse(prompt);
      const AIMessage = groqResponse;
      // Create a new convertation entry
      const newConvertation = {
        userId: userId,
        userMessage: userMessage,
        AIMessage: AIMessage,
      };
      convertationModel.create(newConvertation);
      // Send response back to the client
      res.status(200).json({
        userMessage: userMessage,
        AIMessage: AIMessage,
      });
    } catch (error) {
      logger.error("Error in createConvertation:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  /**
   * Retrieves conversation entries for a given userId, ordered from newest to oldest.
   *
   * @param req - Express request object containing query parameters.
   * @param res - Express response object to send the response back to the client.
   */
  async getConvertation(req: Request, res: Response) {
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
      const conversations = convertationModel
        .search("userId", "==", userId)
        .sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
        .slice(0, validLimit);

      // Send response back to the client
      res.status(200).json(conversations);
    } catch (error) {
      logger.error("Error in getConvertation:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}
