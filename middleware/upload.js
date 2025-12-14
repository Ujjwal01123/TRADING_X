const multer = require("multer");
const fs = require("fs");
const path = require("path");

/**
 * Returns a multer instance for a given folder name.
 * @param {string} folder - Name of the folder inside /uploads
 */
const getUpload = (folder) => {
  const uploadPath = path.join("uploads", folder);

  // Ensure the folder exists
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, unique + ext);
    },
  });

  return multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  });
};

module.exports = getUpload;
