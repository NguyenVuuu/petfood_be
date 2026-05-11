const express = require("express");
const orderController = require("../controllers/orderController");
const { requireUserAuth, requireAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

// Public internal route — called by payment-service (no user auth needed)
router.post("/events/payment-succeeded", orderController.handlePaymentSucceeded);

// All routes below require user auth
router.use(requireUserAuth);

router.post("/", orderController.createOrder);
router.get("/me", orderController.getMyOrders);
router.get("/my-orders", orderController.getMyOrders);
router.get("/admin/waiting-processing", requireAdmin, orderController.listWaitingForProcessing);
router.get("/admin/:id", requireAdmin, orderController.getOrder);
router.patch("/admin/:id/delivery-time", requireAdmin, orderController.updateDeliveryTime);
router.patch("/admin/:id/status", requireAdmin, orderController.updateOrderStatus);
router.get("/admin", requireAdmin, orderController.listOrders);
router.patch("/:id/delivery-popup-seen", orderController.markDeliveryPopupSeen);
router.get("/:id", orderController.getOrder);

module.exports = router;
