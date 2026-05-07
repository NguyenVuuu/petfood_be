const express = require("express");
const orderController = require("../controllers/orderController");
const { requireUserAuth, requireAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(requireUserAuth);

router.post("/", orderController.createOrder);
router.get("/me", orderController.getMyOrders);
router.get("/", requireAdmin, orderController.listOrders);
router.get("/:id", orderController.getOrder);
router.patch("/:id/status", requireAdmin, orderController.updateOrderStatus);

module.exports = router;
