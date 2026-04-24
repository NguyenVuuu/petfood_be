const express = require("express");
const userController = require("../controllers/userController");
const { requireAuth } = require("../middlewares/authMiddleware");
const { requireAdmin } = require("../middlewares/roleMiddleware");

const router = express.Router();

// User self-service endpoints
router.get("/me", requireAuth, userController.getMe);
router.patch("/me", requireAuth, userController.updateMe);
router.patch("/me/password", requireAuth, userController.changeMyPassword);

// Admin endpoints
router.get("/", requireAuth, requireAdmin, userController.listUsers);
router.patch("/:id/role", requireAuth, requireAdmin, userController.updateUserRole);
router.patch("/:id/restore", requireAuth, requireAdmin, userController.restoreUser);

// Internal/auth-service endpoints
router.post("/", userController.createUser);
router.get("/email/:email", userController.getUserByEmail);
router.get("/:id", userController.getUserById);

module.exports = router;
