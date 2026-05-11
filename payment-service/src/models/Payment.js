const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    // VNPay transaction reference
    vnpTxnRef: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    // VNPay transaction number (returned after payment)
    vnpTransactionNo: {
      type: String,
      default: null,
    },
    vnpBankCode: {
      type: String,
      default: null,
    },
    vnpPayDate: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
      default: "PENDING",
      index: true,
    },
    // Raw VNPay return params for audit
    vnpReturnParams: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
      select: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
