import { Request, Response } from "express";
import { userModel } from "./user.model";
import bcrypt from "bcrypt"; // Perbaiki typo dari 'bycryp' menjadi 'bcrypt'
import logger from "../utils/logger.util"; // Import the logger

export default class UserController {
  getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = userModel.readWithOptionsAndFields({
        fields: ["password", "token"],
      });
      logger.info("Retrieved all users", { count: users.length });
      res.status(200).json(users);
    } catch (error) {
      logger.error("Failed to get users", { error });
      res.status(500).json({ error: "Failed to get users" });
    }
  };

  createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { body } = req;

      if (!body.username || !body.password) {
        logger.warn("Missing required fields for createUser", { body });
        res.status(400).json({ error: "Missing required fields" });
        return;
      }

      const user = userModel.search("username", "==", body.username);
      if (user.length > 0) {
        logger.warn("Username is already taken", { username: body.username });
        res.status(400).json({ error: "Username is already taken" });
        return;
      }

      body.password = await bcrypt.hash(body.password, 10);
      body.token = "";
      userModel.create(body);

      logger.info("User created successfully", { username: body.username });
      res.status(201).json({ message: "User created", data: body });
    } catch (error) {
      logger.error("Failed to create user", { error });
      res.status(500).json({ error: "Failed to create user" });
    }
  };

  updateUser = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
      const { body } = req;

      const user = userModel.search("username", "==", body.username);
      if (user.length > 0) {
        logger.warn("Username is already taken", { username: body.username });
        res.status(400).json({ error: "Username is already taken" });
        return;
      }

      if (body.password) body.password = await bcrypt.hash(body.password, 10);

      const oldUser = userModel.advancedSearch({
        field: "id",
        operator: "==",
        value: id,
        withOutFields: ["token"],
      });
      const newUser = { ...oldUser[0], ...body };
      userModel.update(id, newUser);

      logger.info("User updated successfully", { id });
      res.status(200).json({ message: "User updated", data: newUser });
    } catch (error) {
      logger.error("Failed to update user", { id, error });
      res.status(500).json({ error: "Failed to update user" });
    }
  };

  deleteUser = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
      userModel.deleteWithRelation(id);
      logger.info("User deleted successfully", { id });
      res.status(200).json({ message: "User deleted" });
    } catch (error) {
      logger.error("Failed to delete user", { id, error });
      res.status(500).json({ error: "Failed to delete user" });
    }
  };

  getUserById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
      const user = userModel.search("id", "==", id);
      if (user.length === 0) {
        logger.warn("User not found", { id });
        res.status(404).json({ error: "User not found" });
        return;
      }

      logger.info("Retrieved user by ID", { id });
      res.status(200).json(user);
    } catch (error) {
      logger.error("Failed to get user", { id, error });
      res.status(500).json({ error: "Failed to get user" });
    }
  };
}
