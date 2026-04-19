const path = require("path");
const crypto = require("crypto");
const slugify = require("slugify");
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const {
  awsRegion,
  awsAccessKeyId,
  awsSecretAccessKey,
  awsBucket,
  awsPublicBaseUrl,
} = require("../config/env");

const credentials =
  awsAccessKeyId && awsSecretAccessKey
    ? {
        accessKeyId: awsAccessKeyId,
        secretAccessKey: awsSecretAccessKey,
      }
    : undefined;

const s3Client = new S3Client({
  region: awsRegion,
  credentials,
});

const buildImageKey = (originalname = "product-image") => {
  const ext = path.extname(originalname) || ".jpg";
  const name = path.basename(originalname, ext);
  const safeName = slugify(name, { lower: true, strict: true, trim: true }) || "product-image";
  const randomSuffix = crypto.randomBytes(4).toString("hex");

  return `image/products/${Date.now()}-${safeName}-${randomSuffix}${ext.toLowerCase()}`;
};

const buildPublicUrl = (key) => {
  if (awsPublicBaseUrl) {
    return `${awsPublicBaseUrl.replace(/\/$/, "")}/${key}`;
  }

  return `https://${awsBucket}.s3.${awsRegion}.amazonaws.com/${key}`;
};

const uploadProductImage = async (file) => {
  const key = buildImageKey(file.originalname);

  await s3Client.send(
    new PutObjectCommand({
      Bucket: awsBucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );

  return {
    key,
    url: buildPublicUrl(key),
  };
};

const deleteProductImage = async (key) => {
  if (!key || !key.startsWith("image/products/")) {
    return;
  }

  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: awsBucket,
      Key: key,
    })
  );
};

module.exports = {
  uploadProductImage,
  deleteProductImage,
};
