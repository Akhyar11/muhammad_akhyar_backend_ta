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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadBufferToDrive = uploadBufferToDrive;
exports.deleteFileFromDrive = deleteFileFromDrive;
exports.getFileFromDrive = getFileFromDrive;
const googleapis_1 = require("googleapis");
const stream_1 = require("stream");
// Pastikan variabel lingkungan berikut telah didefinisikan:
// GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_DRIVE_FOLDER_ID, dsb.
// Konfigurasi autentikasi menggunakan service account
const auth = new googleapis_1.google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: (_a = process.env.GOOGLE_PRIVATE_KEY) === null || _a === void 0 ? void 0 : _a.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/drive"],
});
const drive = googleapis_1.google.drive({ version: "v3", auth });
/**
 * Mengupload file yang dikirimkan melalui API (sebagai Buffer) ke Google Drive.
 * @param fileBuffer - Buffer berisi data file yang diupload.
 * @param fileName - Nama file yang akan digunakan di Google Drive.
 * @param mimeType - Tipe MIME file yang diupload.
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
            const webContentLink = result.data.webContentLink || "";
            return { fileId, webContentLink };
        }
        catch (error) {
            console.error("Error during file upload:", error);
            throw error;
        }
    });
}
/**
 * Menghapus file di Google Drive berdasarkan fileId.
 * @param fileId - ID file pada Google Drive.
 */
function deleteFileFromDrive(fileId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield drive.files.delete({
                fileId: fileId,
            });
        }
        catch (error) {
            console.error("Error during file deletion:", error);
            throw error;
        }
    });
}
/**
 * Mengambil file dari Google Drive dalam bentuk Buffer.
 * @param fileId - ID file pada Google Drive.
 * @returns Buffer yang berisi data file.
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
                    console.error("Error during file download:", err);
                    reject(err);
                });
            });
        }
        catch (error) {
            console.error("Error during getFileFromDrive:", error);
            throw error;
        }
    });
}
