const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const requiredEnvVars = [
  "PAYMENT_MONGODB_URI",
  "JWT_SECRET",
  "VNPAY_TMN_CODE",
  "VNPAY_HASH_SECRET",
  "VNPAY_URL",
  "VNPAY_RETURN_URL",
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PAYMENT_PORT || 3009),
  mongoUri: process.env.PAYMENT_MONGODB_URI,
  corsOrigin: process.env.PAYMENT_CORS_ORIGIN || "*",
  jwtSecret: process.env.JWT_SECRET,

  vnpay: {
    tmnCode: process.env.VNPAY_TMN_CODE,
    hashSecret: process.env.VNPAY_HASH_SECRET,
    url: process.env.VNPAY_URL,
    // Add ngrok bypass header param to return URL
    returnUrl: process.env.VNPAY_RETURN_URL,
  },

  orderServiceUrl: process.env.ORDER_SERVICE_URL || "http://localhost:3008",
  orderServiceTimeoutMs: Number(process.env.PAYMENT_ORDER_TIMEOUT_MS || 5000),
};
