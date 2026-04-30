const express = require("express");
const productController = require("../controllers/productController");
const { upload } = require("../middlewares/uploadMiddleware");
const { requireAuth, optionalAuth } = require("../middlewares/authMiddleware");
const { requireAdmin } = require("../middlewares/roleMiddleware");

const router = express.Router();

router.get("/", optionalAuth, productController.listProducts);
router.get("/search", optionalAuth, productController.listProducts);
router.get("/:id", productController.getProductDetail);
router.post("/", requireAuth, requireAdmin, upload.single("image"), productController.createProduct);
router.put("/:id", requireAuth, requireAdmin, upload.single("image"), productController.updateProduct);
router.delete("/:id", requireAuth, requireAdmin, productController.deleteProduct);

module.exports = router;
