const crypto = require("crypto");
const { vnpay } = require("../config/env");

/**
 * Format date to VNPay yyyyMMddHHmmss
 */
const formatDate = (date) => {
  const pad = (n) => String(n).padStart(2, "0");
  return (
    date.getFullYear().toString() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
};

/**
 * Generate unique transaction reference
 */
const generateTxnRef = (orderId) => {
  const ts = Date.now().toString().slice(-8);
  const suffix = orderId.toString().slice(-6);
  return `${ts}${suffix}`;
};

/**
 * Create HMAC-SHA512 signature
 */
const createSignature = (data, secret) => {
  return crypto.createHmac("sha512", secret).update(data).digest("hex");
};

/**
 * Sort object keys and build query string (VNPay requirement)
 */
const buildQueryString = (params) => {
  return Object.keys(params)
    .sort()
    .map((key) => `${key}=${encodeURIComponent(params[key]).replace(/%20/g, "+")}`)
    .join("&");
};

/**
 * Create VNPay payment URL
 * @param {Object} options
 * @param {string} options.txnRef - unique transaction reference
 * @param {number} options.amount - amount in VND
 * @param {string} options.orderInfo - order description
 * @param {string} options.ipAddr - client IP
 * @param {string} options.locale - vn | en
 */
const createPaymentUrl = ({ txnRef, amount, orderInfo, ipAddr, locale = "vn" }) => {
  const now = new Date();

  const params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: vnpay.tmnCode,
    vnp_Locale: locale,
    vnp_CurrCode: "VND",
    vnp_TxnRef: txnRef,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: "other",
    vnp_Amount: amount * 100, // VNPay requires amount * 100
    vnp_ReturnUrl: vnpay.returnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: formatDate(now),
  };

  const queryString = buildQueryString(params);
  const signature = createSignature(queryString, vnpay.hashSecret);

  return `${vnpay.url}?${queryString}&vnp_SecureHash=${signature}`;
};

/**
 * Verify VNPay return/IPN signature
 * Returns true if signature is valid
 */
const verifyReturnUrl = (query) => {
  const { vnp_SecureHash, vnp_SecureHashType, ...params } = query;

  const queryString = buildQueryString(params);
  const expectedHash = createSignature(queryString, vnpay.hashSecret);

  return vnp_SecureHash === expectedHash;
};

module.exports = {
  generateTxnRef,
  createPaymentUrl,
  verifyReturnUrl,
  formatDate,
};
