"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const XLSX = __importStar(require("xlsx"));
const fs = __importStar(require("fs"));
const antropomerty_model_1 = require("./antropomerty.model");
const logger_util_1 = __importDefault(require("../utils/logger.util")); // Import the logger
const path_1 = __importDefault(require("path"));
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
                let data = yield yield antropomerty_model_1.anthropometryModel.advancedSearch({
                    field: "userId",
                    operator: "==",
                    value: id,
                    withOutFields: ["userId"],
                });
                if (periode_akhir && periode_awal) {
                    data = data.filter((item) => {
                        const tanggal = new Date(item.date);
                        return (tanggal >= new Date(periode_awal) &&
                            tanggal <= new Date(periode_akhir));
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
    // Get all anthropometry data and export to Excel
    exportToExcel(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { periode_awal, periode_akhir } = req.query;
                logger_util_1.default.info("Exporting anthropometry data to Excel", { userId: id });
                // Ambil data sesuai ID
                let data = yield antropomerty_model_1.anthropometryModel.advancedSearch({
                    field: "userId",
                    operator: "==",
                    value: id,
                    withOutFields: ["userId"],
                });
                if (periode_akhir && periode_awal) {
                    data = data.filter((item) => {
                        const tanggal = new Date(item.date);
                        return (tanggal >= new Date(periode_awal) &&
                            tanggal <= new Date(periode_akhir));
                    });
                }
                if (data.length === 0) {
                    logger_util_1.default.warn("No data found for export", { userId: id });
                    res.status(404).json({ message: "No data found for export" });
                    return;
                }
                // Buat worksheet dari data
                const worksheet = XLSX.utils.json_to_sheet(data);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, "Anthropometry Data");
                // Simpan file ke dalam folder temp
                const filePath = path_1.default.join(__dirname, "../../../tmp/temp", `Anthropometry_${id}.xlsx`);
                XLSX.writeFile(workbook, filePath);
                logger_util_1.default.info("Excel file generated successfully", { filePath });
                // Kirim file sebagai response
                res.download(filePath, `Anthropometry_${id}.xlsx`, (err) => {
                    if (err) {
                        logger_util_1.default.error("Error sending Excel file", { error: err });
                        res.status(500).json({ message: "Error sending file" });
                    }
                    // Hapus file setelah dikirim
                    fs.unlinkSync(filePath);
                });
            }
            catch (error) {
                console.log(error);
                logger_util_1.default.error("Failed to export anthropometry data", { error });
                res.status(500).json({ message: "Failed to export data" });
            }
        });
    }
}
exports.default = AnthropometryController;
