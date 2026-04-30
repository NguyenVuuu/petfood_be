const express = require("express");
const authController = require("../controllers/authController");
const { requireAuth } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh); // đọc refreshToken từ cookie, trả accessToken mới
router.post("/logout", authController.logout); // xóa session + clear cookie
router.get("/me", requireAuth, authController.me);

module.exports = router;
