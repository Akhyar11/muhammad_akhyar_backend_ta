import multer from "multer";

// Konfigurasi multer untuk menyimpan file sebagai buffer di memory
// sehingga bisa langsung dikirim ke Google Drive tanpa menyimpan di disk
const storage = multer.memoryStorage();

// Filter file untuk memastikan hanya gambar yang diupload
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Menerima hanya file gambar
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"));
  }
};

// Konfigurasi upload
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Batas ukuran file 5MB
  },
});
