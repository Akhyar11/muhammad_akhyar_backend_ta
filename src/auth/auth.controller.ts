import { Request, Response } from "express";
import { userModel } from "../user/user.model";
import bcrypt from "bcrypt"; // Perbaiki typo dari 'bycryp' menjadi 'bcrypt'
import jwt from "jsonwebtoken";
import logger from "../utils/logger.util"; // Import the logger

export default class AuthController {
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { body } = req;
      const user = await userModel.search("username", "==", body.username);

      if (user.length === 0) {
        logger.warn("Login attempt with invalid username", {
          username: body.username,
        });
        res.status(401).json({ message: "Invalid username or password" });
        return;
      }

      const isPasswordCorrect = await bcrypt.compare(
        body.password,
        user[0].password
      );

      if (!isPasswordCorrect) {
        logger.warn("Login attempt with invalid password", {
          username: body.username,
        });
        res.status(401).json({ message: "Invalid username or password" });
        return;
      }

      if (!process.env.JWT_SECRET) {
        logger.error("JWT_SECRET is not defined");
        throw new Error("JWT_SECRET is not defined");
      }

      const token = jwt.sign(
        { id: user[0].id, username: user[0].username },
        process.env.JWT_SECRET
      );

      await userModel.update(user[0].id, { ...user[0], token });
      logger.info("User logged in successfully", {
        username: user[0].username,
      });

      res.status(200).json({
        token,
        id: user[0].id,
        username: body.username,
        jk: user[0].jk,
        tgl_lahir: user[0].tgl_lahir,
      });
    } catch (error) {
      console.log(error);
      logger.error("Failed to login", { error });
      res.status(500).json({ message: "Failed to login, server error" });
    }
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      const { body } = req;
      const user = await userModel.search("token", "==", body.token);

      if (user.length === 0) {
        logger.warn("Logout attempt with invalid token", { token: body.token });
        res.status(401).json({ message: "Invalid token" });
        return;
      }

      const isPasswordCorrect = await bcrypt.compare(
        body.password,
        user[0].password
      );

      if (!isPasswordCorrect) {
        logger.warn("Logout attempt with invalid password", {
          username: user[0].username,
        });
        res.status(401).json({ message: "Invalid password" });
        return;
      }

      await userModel.update(user[0].id, { ...user[0], token: "" });
      logger.info("User logged out successfully", {
        username: user[0].username,
      });
      res.status(200).json({ message: "Logged out" });
    } catch (error) {
      logger.error("Failed to logout", { error });
      console.log(error);
      res.status(500).json({ message: "Failed to logout" });
    }
  };

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { body } = req;
      const user = await userModel.search("username", "==", body.username);

      if (user[0]) {
        logger.warn("Registration attempt for existing user", {
          username: body.username,
        });
        res.status(401).json({ message: "User already exists" });
        return;
      }

      const hashedPassword = await bcrypt.hash(body.password, 10);

      const dummyUser = {
        username: "dummy",
        password: "dummy",
        jk: "",
        tgl_lahir: "",
        token: "",
        iotIsAllowed: false,
      };

      const newUser = await userModel.create({
        ...dummyUser,
        ...body,
        password: hashedPassword,
      });

      logger.info("User registered successfully", {
        username: dummyUser.username,
      });
      res.status(200).json({ message: "User created", user: newUser });
    } catch (error) {
      logger.error("Failed to register user", { error });
      res.status(500).json({ message: "Failed to register" });
    }
  };

  me = async (req: Request, res: Response) => {
    try {
      const { body } = req;

      if (!body.token || body.token === "") {
        logger.warn("Token is required for me endpoint");
        res.status(401).json({ message: "Token is required" });
        return;
      }

      const user = await userModel.advancedSearch({
        field: "token",
        operator: "==",
        value: body.token,
        withOutFields: ["password", "token"],
      });

      if (user.length === 0) {
        logger.warn("Invalid token used in me endpoint", { token: body.token });
        res.status(401).json({ message: "not login, please login" });
        return;
      }

      logger.info("User retrieved successfully from me endpoint", {
        username: user[0].username,
      });
      res.status(200).json({ data: user[0] });
    } catch (error) {
      console.log(error);
      logger.error("Failed to get user from me endpoint", { error });
      res.status(500).json({ message: "Failed to get user" });
    }
  };
}
