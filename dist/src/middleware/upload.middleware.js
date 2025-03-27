"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
// Konfigurasi multer untuk menyimpan file sebagai buffer di memory
// sehingga bisa langsung dikirim ke Google Drive tanpa menyimpan di disk
const storage = multer_1.default.memoryStorage();
// Filter file untuk memastikan hanya gambar yang diupload
const fileFilter = (req, file, cb) => {
    // Menerima hanya file gambar
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    }
    else {
        cb(new Error("Only image files are allowed!"));
    }
};
// Konfigurasi upload
exports.upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // Batas ukuran file 5MB
    },
});
