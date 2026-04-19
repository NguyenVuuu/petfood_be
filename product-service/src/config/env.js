const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const requiredEnvVars = ["PRODUCT_MONGODB_URI", "AWS_REGION", "AWS_S3_BUCKET"];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PRODUCT_PORT || 3003),
  mongoUri: process.env.PRODUCT_MONGODB_URI,
  corsOrigin: process.env.PRODUCT_CORS_ORIGIN || "*",
  awsRegion: process.env.AWS_REGION,
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  awsBucket: process.env.AWS_S3_BUCKET,
  awsPublicBaseUrl: process.env.AWS_S3_PUBLIC_BASE_URL || "",
  productImageMaxSizeMb: Number(process.env.PRODUCT_IMAGE_MAX_SIZE_MB || 5),
  productImageAllowedMime: (process.env.PRODUCT_IMAGE_ALLOWED_MIME ||
    "image/jpeg,image/png,image/webp")
    .split(",")
    .map((type) => type.trim())
    .filter(Boolean),
};
