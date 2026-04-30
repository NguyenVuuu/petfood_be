const S3Provider = require("./s3Provider");
const CloudinaryProvider = require("./cloudinaryProvider");

const s3Provider = new S3Provider();
const cloudinaryProvider = new CloudinaryProvider();

const getProvider = (providerName) => {
  if (providerName === "s3") return s3Provider;
  if (providerName === "cloudinary") return cloudinaryProvider;

  const error = new Error("Unsupported provider");
  error.statusCode = 400;
  throw error;
};

module.exports = {
  getProvider,
};
