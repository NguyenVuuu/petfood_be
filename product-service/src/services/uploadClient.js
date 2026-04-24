const axios = require("axios");
const FormData = require("form-data");
const { uploadServiceUrl, uploadServiceTimeoutMs } = require("../config/env");

const uploadProductImage = async (file) => {
  const formData = new FormData();
  formData.append("type", "product");
  formData.append("file", file.buffer, {
    filename: file.originalname,
    contentType: file.mimetype,
  });

  try {
    const response = await axios.post(`${uploadServiceUrl}/upload`, formData, {
      timeout: uploadServiceTimeoutMs,
      headers: formData.getHeaders(),
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      const mappedError = new Error(error.response.data?.message || "Upload failed");
      mappedError.statusCode = error.response.status;
      throw mappedError;
    }

    const upstreamError = new Error("upload-service is unavailable");
    upstreamError.statusCode = 502;
    throw upstreamError;
  }
};

const deleteProductImage = async ({ provider, key }) => {
  if (!key) return;

  try {
    await axios.delete(`${uploadServiceUrl}/upload`, {
      timeout: uploadServiceTimeoutMs,
      data: {
        provider: provider || "s3",
        key,
      },
    });
  } catch (_error) {
    return;
  }
};

module.exports = {
  uploadProductImage,
  deleteProductImage,
};
