const Payment = require("../models/Payment");
const { generateTxnRef, createPaymentUrl, verifyReturnUrl } = require("../utils/vnpay");
const { notifyPaymentSucceeded } = require("../services/orderClient");

/**
 * POST /api/payments/vnpay/create
 * Body: { orderId, amount }
 * Returns: { paymentUrl, txnRef }
 */
const createVnpayPayment = async (req, res, next) => {
  try {
    const { orderId, amount } = req.body;
    const userId = req.auth.sub;

    if (!orderId || !amount || amount <= 0) {
      return res.status(400).json({ message: "orderId and amount are required" });
    }

    const txnRef = generateTxnRef(orderId);

    // Save pending payment record
    const payment = await Payment.create({
      orderId,
      userId,
      amount,
      vnpTxnRef: txnRef,
      status: "PENDING",
    });

    // Get client IP
    const ipAddr =
      req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
      req.socket?.remoteAddress ||
      "127.0.0.1";

    const paymentUrl = createPaymentUrl({
      txnRef,
      amount,
      orderInfo: `Thanh toan don hang ${orderId}`,
      ipAddr,
    });

    return res.status(201).json({
      paymentUrl,
      txnRef,
      paymentId: payment._id,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/payments/vnpay/return
 * VNPay redirects user here after payment (legacy - kept for compatibility)
 */
const vnpayReturn = async (req, res, next) => {
  try {
    const query = req.query;
    const isValid = verifyReturnUrl(query);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    if (!isValid) {
      return res.redirect(`${frontendUrl}/payment/result?status=invalid`);
    }

    const txnRef = query.vnp_TxnRef;
    const responseCode = query.vnp_ResponseCode;
    const transactionNo = query.vnp_TransactionNo;
    const bankCode = query.vnp_BankCode;
    const payDate = query.vnp_PayDate;
    const amount = Number(query.vnp_Amount) / 100;

    const payment = await Payment.findOne({ vnpTxnRef: txnRef });

    if (!payment) {
      return res.redirect(`${frontendUrl}/payment/result?status=not_found`);
    }

    if (responseCode === "00") {
      payment.status = "PAID";
      payment.vnpTransactionNo = transactionNo;
      payment.vnpBankCode = bankCode;
      payment.vnpPayDate = payDate;
      payment.vnpReturnParams = query;
      await payment.save();

      await notifyPaymentSucceeded({
        orderId: payment.orderId.toString(),
        paymentId: payment._id.toString(),
        amount,
        paidAt: new Date().toISOString(),
      });

      return res.redirect(
        `${frontendUrl}/payment/result?status=success&orderId=${payment.orderId}&txnRef=${txnRef}`
      );
    } else {
      payment.status = "FAILED";
      payment.vnpReturnParams = query;
      await payment.save();

      return res.redirect(
        `${frontendUrl}/payment/result?status=failed&orderId=${payment.orderId}&code=${responseCode}`
      );
    }
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/payments/vnpay/verify
 * Frontend calls this with VNPay return params to verify payment
 */
const vnpayVerify = async (req, res, next) => {
  try {
    const query = req.query;
    const isValid = verifyReturnUrl(query);

    if (!isValid) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    const txnRef = query.vnp_TxnRef;
    const responseCode = query.vnp_ResponseCode;
    const transactionNo = query.vnp_TransactionNo;
    const bankCode = query.vnp_BankCode;
    const payDate = query.vnp_PayDate;
    const amount = Number(query.vnp_Amount) / 100;

    const payment = await Payment.findOne({ vnpTxnRef: txnRef });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Idempotent — already processed
    if (payment.status === "PAID") {
      return res.status(200).json({
        status: "PAID",
        orderId: payment.orderId,
        txnRef,
      });
    }

    if (responseCode === "00") {
      payment.status = "PAID";
      payment.vnpTransactionNo = transactionNo;
      payment.vnpBankCode = bankCode;
      payment.vnpPayDate = payDate;
      payment.vnpReturnParams = query;
      await payment.save();

      await notifyPaymentSucceeded({
        orderId: payment.orderId.toString(),
        paymentId: payment._id.toString(),
        amount,
        paidAt: new Date().toISOString(),
      });

      return res.status(200).json({
        status: "PAID",
        orderId: payment.orderId,
        txnRef,
      });
    } else {
      payment.status = "FAILED";
      payment.vnpReturnParams = query;
      await payment.save();

      return res.status(200).json({
        status: "FAILED",
        orderId: payment.orderId,
        txnRef,
        code: responseCode,
      });
    }
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/payments/status/:txnRef
 * Frontend polls this to check payment status
 */
const getPaymentStatus = async (req, res, next) => {
  try {
    const { txnRef } = req.params;
    const payment = await Payment.findOne({ vnpTxnRef: txnRef });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    return res.status(200).json({
      status: payment.status,
      orderId: payment.orderId,
      amount: payment.amount,
      txnRef: payment.vnpTxnRef,
      paidAt: payment.vnpPayDate || null,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createVnpayPayment,
  vnpayReturn,
  vnpayVerify,
  getPaymentStatus,
};
