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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadBufferToDrive = uploadBufferToDrive;
exports.deleteFileFromDrive = deleteFileFromDrive;
exports.getFileFromDrive = getFileFromDrive;
const googleapis_1 = require("googleapis");
const stream_1 = require("stream");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // Memuat variabel lingkungan dari .env
// Konfigurasi autentikasi menggunakan service account
const privateKey = (_a = process.env.GOOGLE_PRIVATE_KEY) === null || _a === void 0 ? void 0 : _a.replace(/\\n/g, "\n");
if (!privateKey)
    throw new Error("GOOGLE_PRIVATE_KEY tidak ditemukan!");
console.log(privateKey);
const auth = new googleapis_1.google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/drive"],
});
const drive = googleapis_1.google.drive({ version: "v3", auth });
/**
 * Mengupload file ke Google Drive.
 * @param fileBuffer - Buffer data file.
 * @param fileName - Nama file yang akan digunakan di Google Drive.
 * @param mimeType - Jenis file (contoh: "image/png", "application/pdf").
 * @returns Object yang berisi fileId dan webContentLink.
 */
function uploadBufferToDrive(fileBuffer, fileName, mimeType) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const fileMetadata = {
                name: fileName,
                parents: [process.env.GOOGLE_DRIVE_FOLDER_ID || ""],
            };
            const bufferStream = new stream_1.PassThrough();
            bufferStream.end(fileBuffer);
            const media = {
                mimeType: mimeType,
                body: bufferStream,
            };
            const response = yield drive.files.create({
                requestBody: fileMetadata,
                media: media,
                fields: "id",
            });
            const fileId = response.data.id;
            if (!fileId) {
                throw new Error("Gagal mendapatkan file ID dari Google Drive.");
            }
            // Mengatur file agar bisa diakses oleh siapa saja (public link)
            yield drive.permissions.create({
                fileId: fileId,
                requestBody: {
                    role: "reader",
                    type: "anyone",
                },
            });
            const result = yield drive.files.get({
                fileId: fileId,
                fields: "webViewLink, webContentLink",
            });
            return {
                fileId,
                webContentLink: result.data.webContentLink || "",
            };
        }
        catch (error) {
            console.error("Error saat upload file:", error);
            throw error;
        }
    });
}
/**
 * Menghapus file dari Google Drive.
 * @param fileId - ID file pada Google Drive.
 */
function deleteFileFromDrive(fileId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield drive.files.delete({ fileId });
        }
        catch (error) {
            console.error("Error saat menghapus file:", error);
            throw error;
        }
    });
}
/**
 * Mengambil file dari Google Drive dalam bentuk Buffer.
 * @param fileId - ID file pada Google Drive.
 * @returns Buffer berisi data file.
 */
function getFileFromDrive(fileId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield drive.files.get({
                fileId: fileId,
                alt: "media",
            }, { responseType: "stream" });
            return new Promise((resolve, reject) => {
                const chunks = [];
                response.data.on("data", (chunk) => {
                    chunks.push(chunk);
                });
                response.data.on("end", () => {
                    resolve(Buffer.concat(chunks));
                });
                response.data.on("error", (err) => {
                    console.error("Error saat mendownload file:", err);
                    reject(err);
                });
            });
        }
        catch (error) {
            console.error("Error saat getFileFromDrive:", error);
            throw error;
        }
    });
}
