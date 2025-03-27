import { google, drive_v3 } from "googleapis";
import { PassThrough } from "stream";

// Pastikan variabel lingkungan berikut telah didefinisikan:
// GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_DRIVE_FOLDER_ID, dsb.

// Konfigurasi autentikasi menggunakan service account
const auth = new google.auth.JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/drive"],
});

const drive: drive_v3.Drive = google.drive({ version: "v3", auth });

/**
 * Mengupload file yang dikirimkan melalui API (sebagai Buffer) ke Google Drive.
 * @param fileBuffer - Buffer berisi data file yang diupload.
 * @param fileName - Nama file yang akan digunakan di Google Drive.
 * @param mimeType - Tipe MIME file yang diupload.
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

    const webContentLink = result.data.webContentLink || "";
    return { fileId, webContentLink };
  } catch (error) {
    console.error("Error during file upload:", error);
    throw error;
  }
}

/**
 * Menghapus file di Google Drive berdasarkan fileId.
 * @param fileId - ID file pada Google Drive.
 */
export async function deleteFileFromDrive(fileId: string): Promise<void> {
  try {
    await drive.files.delete({
      fileId: fileId,
    });
  } catch (error) {
    console.error("Error during file deletion:", error);
    throw error;
  }
}

/**
 * Mengambil file dari Google Drive dalam bentuk Buffer.
 * @param fileId - ID file pada Google Drive.
 * @returns Buffer yang berisi data file.
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
      response.data.on("error", (err: any) => {
        console.error("Error during file download:", err);
        reject(err);
      });
    });
  } catch (error) {
    console.error("Error during getFileFromDrive:", error);
    throw error;
  }
}
