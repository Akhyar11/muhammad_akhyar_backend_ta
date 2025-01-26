import multer from "multer";
import path from "path";

// Konfigurasi penyimpanan
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("Multer destination middleware executed");
    cb(null, path.join(__dirname, "../../uploads")); // Folder untuk menyimpan file
  },
  filename: (req, file, cb) => {
    console.log("Multer filename middleware executed");
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    ); // Menyimpan dengan nama unik
  },
});

// Inisialisasi multer
export const upload = multer({ storage });
