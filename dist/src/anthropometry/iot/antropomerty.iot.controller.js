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
const antropomerty_model_1 = require("../antropomerty.model");
const logger_util_1 = __importDefault(require("../../utils/logger.util")); // Import the logger
const user_model_1 = require("../../user/user.model");
const groq_service_1 = require("../../groq/groq.service");
const profil_model_1 = require("../../profil/profil.model");
function calculateBMI(height, weight) {
    return `${weight / Math.pow(height / 100, 2)}`;
}
// Controller for anthropometry IoT
class AnthropometryIotController {
    // Get data from IoT
    setData(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { height, weight, notes, userId } = req.query;
                console.log({ height, weight, notes, userId });
                const date = new Date().toString();
                // Validate data
                if (!height || !weight) {
                    logger_util_1.default.warn("Missing required fields in getData", {
                        userId,
                        height,
                        weight,
                    });
                    res.status(400).json({ message: "Missing required fields" });
                    return;
                }
                // Check if user exists
                const user = user_model_1.userModel.search("id", "==", userId);
                if (!user || user.length === 0) {
                    logger_util_1.default.warn("User not found in getData", { userId });
                    res.status(404).json({ message: "User not found" });
                    return;
                }
                // Calculate BMI
                const bmi = calculateBMI(Number(height), Number(weight));
                logger_util_1.default.info("Calculated BMI", { userId, height, weight, bmi });
                // Save data
                antropomerty_model_1.anthropometryModel.create({ userId, height, weight, bmi, date, notes });
                logger_util_1.default.info("Data saved successfully", {
                    userId,
                    height,
                    weight,
                    bmi,
                    date,
                    notes,
                });
                const summary = yield (0, groq_service_1.groqCreateSummaryAnthropometry)(userId);
                const profil = profil_model_1.profilModel.search("userId", "==", userId);
                profil_model_1.profilModel.update(profil[0].id, { summary });
                // Return response
                res.status(200).json({ message: "Data saved successfully" });
            }
            catch (error) {
                console.log(error);
                logger_util_1.default.error("Failed to save data in getData", { error });
                res.status(500).json({ message: "Internal server error" });
            }
        });
    }
    // Get allowed access to IoT
    getAccess(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.query;
                // Check if user exists
                const user = user_model_1.userModel.search("userId", "==", userId);
                if (!user || user.length === 0) {
                    logger_util_1.default.warn("User not found in getAccess", { userId });
                    res.status(404).json({ message: "User not found" });
                    return;
                }
                // Grant access
                user_model_1.userModel.update(userId, Object.assign(Object.assign({}, user[0]), { iotIsAllowed: true }));
                logger_util_1.default.info("Access granted to user", { userId });
                // Return response
                res.status(200).json({ message: "Access granted" });
            }
            catch (error) {
                logger_util_1.default.error("Failed to grant access in getAccess", { error });
                res.status(500).json({ message: "Internal server error" });
            }
        });
    }
}
exports.default = AnthropometryIotController;
