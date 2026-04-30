const axios = require("axios");
const { categoryServiceUrl, categoryServiceTimeoutMs } = require("../config/env");

const ensureActiveCategory = async (categoryId) => {
  if (!categoryId) return null;

  try {
    const response = await axios.get(`${categoryServiceUrl}/api/categories/${categoryId}`, {
      timeout: categoryServiceTimeoutMs,
    });

    if (!response.data?.category) {
      const error = new Error("Invalid response from category-service");
      error.statusCode = 502;
      throw error;
    }

    return response.data.category;
  } catch (error) {
    if (error.response?.status === 404) {
      const notFound = new Error("Category not found or inactive");
      notFound.statusCode = 400;
      throw notFound;
    }

    if (error.statusCode) {
      throw error;
    }

    const upstreamError = new Error("category-service is unavailable");
    upstreamError.statusCode = 502;
    throw upstreamError;
  }
};

module.exports = {
  ensureActiveCategory,
};
