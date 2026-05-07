const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const requiredEnvVars = ["ORDER_MONGODB_URI", "JWT_SECRET"];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.ORDER_PORT || 3008),
  mongoUri: process.env.ORDER_MONGODB_URI,
  corsOrigin: process.env.ORDER_CORS_ORIGIN || "*",
  jwtSecret: process.env.JWT_SECRET,
};
