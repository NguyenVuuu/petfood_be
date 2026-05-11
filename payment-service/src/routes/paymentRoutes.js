const express = require("express");
const { requireUserAuth } = require("../middlewares/authMiddleware");
const {
  createVnpayPayment,
  vnpayReturn,
  vnpayVerify,
  getPaymentStatus,
} = require("../controllers/paymentController");

const router = express.Router();

// VNPay callbacks — no auth
router.get("/vnpay/return", vnpayReturn);
router.get("/vnpay/verify", vnpayVerify);

// Protected routes
router.use(requireUserAuth);
router.post("/vnpay/create", createVnpayPayment);
router.get("/status/:txnRef", getPaymentStatus);

module.exports = router;
