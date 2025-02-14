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
const antropomerty_model_1 = require("./antropomerty.model");
const logger_util_1 = __importDefault(require("../utils/logger.util")); // Import the logger
class AnthropometryController {
    // Get all anthropometry data by user ID
    getAllById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get id from request
                const { id } = req.params;
                const { periode_awal, periode_akhir } = req.query;
                // Log the request for data retrieval
                logger_util_1.default.info("Retrieving anthropometry data for user ID", { userId: id });
                // Get all anthropometry data by id
                let data = antropomerty_model_1.anthropometryModel.advancedSearch({
                    field: "userId",
                    operator: "==",
                    value: id,
                    withOutFields: ["userId"],
                });
                if (periode_akhir && periode_awal) {
                    data = data.filter((item) => {
                        const tanggal = new Date(item.date);
                        return tanggal >= new Date(periode_awal) && tanggal <= new Date(periode_akhir);
                    });
                }
                // Check if data is empty
                if (data.length === 0) {
                    logger_util_1.default.warn("No anthropometry data found for user ID", { userId: id });
                    res.status(200).json({ data: [] });
                    return;
                }
                logger_util_1.default.info("Successfully retrieved anthropometry data", {
                    userId: id,
                    dataCount: data.length,
                });
                res.status(200).json({ data });
            }
            catch (error) {
                logger_util_1.default.error("Failed to get anthropometry data", { error });
                res.status(500).json({ message: "Failed to get anthropometry data" });
            }
        });
    }
}
exports.default = AnthropometryController;
