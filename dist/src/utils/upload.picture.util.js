"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
// Konfigurasi penyimpanan
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        console.log("Multer destination middleware executed");
        cb(null, path_1.default.join(__dirname, "../../uploads")); // Folder untuk menyimpan file
    },
    filename: (req, file, cb) => {
        console.log("Multer filename middleware executed");
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path_1.default.extname(file.originalname)); // Menyimpan dengan nama unik
    },
});
// Inisialisasi multer
exports.upload = (0, multer_1.default)({ storage });
