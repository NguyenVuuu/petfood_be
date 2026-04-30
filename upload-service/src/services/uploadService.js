const { buildStorageFileName } = require("../utils/fileName");
const { resolveProviderByType, resolveFolderByType } = require("../utils/uploadType");
const { getProvider } = require("../providers/providerFactory");

const uploadFile = async ({ file, type }) => {
  const providerName = resolveProviderByType(type);
  const folder = resolveFolderByType(type);

  if (!providerName || !folder) {
    const error = new Error("Unsupported upload type");
    error.statusCode = 400;
    throw error;
  }

  const key = `${folder}/${buildStorageFileName(file.originalname)}`;
  const provider = getProvider(providerName);

  const uploaded = await provider.upload({
    buffer: file.buffer,
    mimeType: file.mimetype,
    key,
    folder,
  });

  return {
    ...uploaded,
    metadata: {
      type,
      size: file.size,
      mimeType: file.mimetype,
      originalName: file.originalname,
    },
  };
};

const deleteFile = async ({ provider, key }) => {
  const instance = getProvider(provider);
  return instance.delete({ key });
};

const createPresignedUploadUrl = async ({ type, fileName, mimeType, expiresInSec }) => {
  const providerName = resolveProviderByType(type);

  if (providerName !== "s3") {
    const error = new Error("Presigned upload is only supported for S3 types");
    error.statusCode = 400;
    throw error;
  }

  const folder = resolveFolderByType(type);
  const key = `${folder}/${buildStorageFileName(fileName)}`;

  const provider = getProvider("s3");

  return provider.createPresignedUploadUrl({
    key,
    mimeType,
    expiresInSec,
  });
};

module.exports = {
  uploadFile,
  deleteFile,
  createPresignedUploadUrl,
};
