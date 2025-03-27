import { google, drive_v3 } from "googleapis";
import { PassThrough } from "stream";
import dotenv from "dotenv";

dotenv.config(); // Memuat variabel lingkungan dari .env

// Konfigurasi autentikasi menggunakan service account
const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
if (!privateKey) throw new Error("GOOGLE_PRIVATE_KEY tidak ditemukan!");

const auth = new google.auth.JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: privateKey,
  scopes: ["https://www.googleapis.com/auth/drive"],
});

const drive: drive_v3.Drive = google.drive({ version: "v3", auth });

/**
 * Mengupload file ke Google Drive.
 * @param fileBuffer - Buffer data file.
 * @param fileName - Nama file yang akan digunakan di Google Drive.
 * @param mimeType - Jenis file (contoh: "image/png", "application/pdf").
 * @returns Object yang berisi fileId dan webContentLink.
 */
export async function uploadBufferToDrive(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<{ fileId: string; webContentLink: string }> {
  try {
    const fileMetadata = {
      name: fileName,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID || ""],
    };

    const bufferStream = new PassThrough();
    bufferStream.end(fileBuffer);

    const media = {
      mimeType: mimeType,
      body: bufferStream,
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id",
    });

    const fileId = response.data.id;
    if (!fileId) {
      throw new Error("Gagal mendapatkan file ID dari Google Drive.");
    }

    // Mengatur file agar bisa diakses oleh siapa saja (public link)
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    const result = await drive.files.get({
      fileId: fileId,
      fields: "webViewLink, webContentLink",
    });

    return {
      fileId,
      webContentLink: result.data.webContentLink || "",
    };
  } catch (error) {
    console.error("Error saat upload file:", error);
    throw error;
  }
}

/**
 * Menghapus file dari Google Drive.
 * @param fileId - ID file pada Google Drive.
 */
export async function deleteFileFromDrive(fileId: string): Promise<void> {
  try {
    await drive.files.delete({ fileId });
  } catch (error) {
    console.error("Error saat menghapus file:", error);
    throw error;
  }
}

/**
 * Mengambil file dari Google Drive dalam bentuk Buffer.
 * @param fileId - ID file pada Google Drive.
 * @returns Buffer berisi data file.
 */
export async function getFileFromDrive(fileId: string): Promise<Buffer> {
  try {
    const response = await drive.files.get(
      {
        fileId: fileId,
        alt: "media",
      },
      { responseType: "stream" }
    );

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      response.data.on("data", (chunk: Buffer) => {
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
  } catch (error) {
    console.error("Error saat getFileFromDrive:", error);
    throw error;
  }
}
