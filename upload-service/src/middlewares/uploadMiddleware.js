const multer = require("multer");
const { allowedMimeTypes, maxFileSizeMb } = require("../config/env");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maxFileSizeMb * 1024 * 1024,
  },
  fileFilter: (req, file, callback) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      const error = new Error("Invalid file type. Only jpg, png, webp are allowed");
      error.statusCode = 400;
      return callback(error);
    }

    return callback(null, true);
  },
});

module.exports = {
  upload,
};
