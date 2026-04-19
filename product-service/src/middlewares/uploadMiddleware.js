const multer = require("multer");
const { productImageMaxSizeMb, productImageAllowedMime } = require("../config/env");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: productImageMaxSizeMb * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!productImageAllowedMime.includes(file.mimetype)) {
      const error = new Error("Unsupported file type");
      error.statusCode = 400;
      return cb(error);
    }

    return cb(null, true);
  },
});

module.exports = {
  upload,
};
