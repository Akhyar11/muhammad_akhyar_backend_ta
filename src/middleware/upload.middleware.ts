import multer from "multer";
import { Request, Response, NextFunction } from "express";

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

// Konfigurasi upload dengan batas ukuran file
const uploadConfig = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    fieldSize: 10 * 1024 * 1024, // 10MB field size limit
  },
});

/**
 * Adapter middleware to handle requests where files are already in req.files
 * (processed by Express-Fileupload or similar middleware)
 */
const handleExistingFiles = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // If req.files exists, we'll process it directly instead of using multer
  if (req.files && Object.keys(req.files).length > 0) {
    // Validate file types
    for (const fieldName in req.files) {
      const file = (req.files as any)[fieldName];

      // Handle both single file and array of files
      const files = Array.isArray(file) ? file : [file];

      for (const f of files) {
        if (!f.mimetype.startsWith("image/")) {
          return res.status(400).json({
            error: "Only image files are allowed!",
          });
        }

        // Check file size (5MB limit)
        if (f.size > 5 * 1024 * 1024) {
          return res.status(413).json({
            error: "File too large. Maximum size is 5MB.",
          });
        }
      }
    }

    // Files are valid, continue
    return next();
  }

  // If req.files doesn't exist, continue to multer middleware
  next();
};

// Wrapper untuk menangani error dari multer
export const upload = {
  single: (fieldName: string) => {
    return [
      // First check if files are already in req.files
      // Then use multer as fallback
      (req: Request, res: Response, next: NextFunction) => {
        handleExistingFiles(req, res, next);

        // Skip multer if files are already processed
        if (req.files && Object.keys(req.files).length > 0) {
          return next();
        }

        uploadConfig.single(fieldName)(req, res, (err) => {
          if (err) {
            if (err instanceof multer.MulterError) {
              // Multer error (file too large, unexpected field, etc.)
              if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(413).json({
                  error: "File too large. Maximum size is 5MB.",
                });
              }
              return res.status(400).json({
                error: `Upload error: ${err.message}`,
              });
            } else {
              // Unexpected error (like "Unexpected end of form")
              return res.status(400).json({
                error: err.message || "Error processing upload",
              });
            }
          }
          next();
        });
      },
    ];
  },

  array: (fieldName: string, maxCount: number) => {
    return [
      // First check if files are already in req.files
      handleExistingFiles,
      // Then use multer as fallback
      (req: Request, res: Response, next: NextFunction) => {
        // Skip multer if files are already processed
        if (req.files && Object.keys(req.files).length > 0) {
          return next();
        }

        uploadConfig.array(fieldName, maxCount)(req, res, (err) => {
          if (err) {
            if (err instanceof multer.MulterError) {
              if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(413).json({
                  error: "File too large. Maximum size is 5MB.",
                });
              }
              return res.status(400).json({
                error: `Upload error: ${err.message}`,
              });
            } else {
              return res.status(400).json({
                error: err.message || "Error processing upload",
              });
            }
          }
          next();
        });
      },
    ];
  },

  fields: (fields: multer.Field[]) => {
    return [
      // First check if files are already in req.files
      handleExistingFiles,
      // Then use multer as fallback
      (req: Request, res: Response, next: NextFunction) => {
        // Skip multer if files are already processed
        if (req.files && Object.keys(req.files).length > 0) {
          return next();
        }

        uploadConfig.fields(fields)(req, res, (err) => {
          if (err) {
            if (err instanceof multer.MulterError) {
              if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(413).json({
                  error: "File too large. Maximum size is 5MB.",
                });
              }
              return res.status(400).json({
                error: `Upload error: ${err.message}`,
              });
            } else {
              return res.status(400).json({
                error: err.message || "Error processing upload",
              });
            }
          }
          next();
        });
      },
    ];
  },
};
