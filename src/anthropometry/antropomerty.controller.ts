import { Request, Response } from "express";
import * as XLSX from "xlsx";
import { anthropometryModel } from "./antropomerty.model";
import logger from "../utils/logger.util"; // Import the logger
import { uploadBufferToDrive } from "../utils/google.drive.util";

export default class AnthropometryController {
  // Get all anthropometry data by user ID
  async getAllById(req: Request, res: Response): Promise<void> {
    try {
      // Get id from request
      const { id } = req.params;
      const { periode_awal, periode_akhir } = req.query;

      // Log the request for data retrieval
      logger.info("Retrieving anthropometry data for user ID", { userId: id });

      // Get all anthropometry data by id
      let data = await await anthropometryModel.advancedSearch({
        field: "userId",
        operator: "==",
        value: id,
        withOutFields: ["userId"],
      });

      if (periode_akhir && periode_awal) {
        data = data.filter((item) => {
          const tanggal = new Date(item.date);
          return (
            tanggal >= new Date(periode_awal as string) &&
            tanggal <= new Date(periode_akhir as string)
          );
        });
      }

      // Check if data is empty
      if (data.length === 0) {
        logger.warn("No anthropometry data found for user ID", { userId: id });
        res.status(200).json({ data: [] });
        return;
      }

      logger.info("Successfully retrieved anthropometry data", {
        userId: id,
        dataCount: data.length,
      });
      res.status(200).json({ data });
    } catch (error) {
      logger.error("Failed to get anthropometry data", { error });
      res.status(500).json({ message: "Failed to get anthropometry data" });
    }
  }

  // Get all anthropometry data and export to Excel via Google Drive
  async exportToExcel(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { periode_awal, periode_akhir } = req.query;

      logger.info("Exporting anthropometry data to Excel", { userId: id });

      // Ambil data sesuai ID
      let data = await anthropometryModel.advancedSearch({
        field: "userId",
        operator: "==",
        value: id,
        withOutFields: ["userId"],
      });

      if (periode_akhir && periode_awal) {
        data = data.filter((item) => {
          const tanggal = new Date(item.date);
          return (
            tanggal >= new Date(periode_awal as string) &&
            tanggal <= new Date(periode_akhir as string)
          );
        });
      }

      if (data.length === 0) {
        logger.warn("No data found for export", { userId: id });
        res.status(404).json({ message: "No data found for export" });
        return;
      }

      // Buat worksheet dari data
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Anthropometry Data");

      // Alih-alih menyimpan ke file lokal, kita akan mengkonversi workbook ke buffer
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "buffer",
      });

      // Nama file Excel
      const fileName = `Anthropometry_${id}_${Date.now()}.xlsx`;

      // Upload file Excel ke Google Drive
      const { fileId, webContentLink } = await uploadBufferToDrive(
        excelBuffer,
        fileName,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      logger.info("Excel file uploaded to Google Drive successfully", {
        userId: id,
        fileId,
        fileName,
      });

      // Kirim URL download sebagai response
      res.status(200).json({
        message: "Excel file generated successfully",
        downloadUrl: webContentLink,
      });
    } catch (error) {
      console.log(error);

      logger.error("Failed to export anthropometry data", { error });
      res.status(500).json({ message: "Failed to export data" });
    }
  }
}
