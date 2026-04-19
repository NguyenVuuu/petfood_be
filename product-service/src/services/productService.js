const mongoose = require("mongoose");
const slugify = require("slugify");
const Product = require("../models/Product");
const { uploadProductImage, deleteProductImage } = require("./s3Service");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeCategoryId = (categoryId) => {
  if (categoryId === "" || categoryId === undefined) {
    return null;
  }
  return categoryId;
};

const getSafeSlug = (value) =>
  slugify(value || "", {
    lower: true,
    strict: true,
    trim: true,
  }) || "product";

const ensureObjectId = (id) => {
  if (!mongoose.isValidObjectId(id)) {
    const error = new Error("Invalid product id");
    error.statusCode = 400;
    throw error;
  }
};

const generateUniqueSlug = async (name, excludeId = null) => {
  const baseSlug = getSafeSlug(name);
  let slug = baseSlug;
  let index = 1;

  while (true) {
    const existed = await Product.exists({
      slug,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    });

    if (!existed) {
      return slug;
    }

    slug = `${baseSlug}-${index}`;
    index += 1;
  }
};

const createProduct = async (payload, imageFile) => {
  const uploadedImage = await uploadProductImage(imageFile);

  try {
    const slug = await generateUniqueSlug(payload.name);

    const product = await Product.create({
      ...payload,
      slug,
      categoryId: normalizeCategoryId(payload.categoryId),
      imageUrl: uploadedImage.url,
      imageKey: uploadedImage.key,
    });

    return product;
  } catch (error) {
    await deleteProductImage(uploadedImage.key).catch(() => null);
    throw error;
  }
};

const listProducts = async ({ keyword, page, limit, sortBy, sortOrder }) => {
  const filter = {};

  if (keyword) {
    filter.name = {
      $regex: escapeRegex(keyword),
      $options: "i",
    };
  }

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  const [items, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(limit),
    Product.countDocuments(filter),
  ]);

  return {
    items,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

const getProductDetail = async (productId) => {
  ensureObjectId(productId);

  const product = await Product.findById(productId);

  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  return product;
};

const updateProduct = async (productId, payload, imageFile) => {
  ensureObjectId(productId);

  const product = await Product.findById(productId);

  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  const oldImageKey = product.imageKey;
  let uploadedImage = null;

  if (imageFile) {
    uploadedImage = await uploadProductImage(imageFile);
  }

  try {
    if (payload.name && payload.name !== product.name) {
      product.slug = await generateUniqueSlug(payload.name, productId);
    }

    if (payload.name !== undefined) product.name = payload.name;
    if (payload.description !== undefined) product.description = payload.description;
    if (payload.price !== undefined) product.price = payload.price;
    if (payload.stock !== undefined) product.stock = payload.stock;
    if (payload.categoryId !== undefined) {
      product.categoryId = normalizeCategoryId(payload.categoryId);
    }
    if (payload.isActive !== undefined) product.isActive = payload.isActive;

    if (uploadedImage) {
      product.imageKey = uploadedImage.key;
      product.imageUrl = uploadedImage.url;
    }

    await product.save();

    if (uploadedImage && oldImageKey && oldImageKey !== uploadedImage.key) {
      await deleteProductImage(oldImageKey).catch(() => null);
    }

    return product;
  } catch (error) {
    if (uploadedImage) {
      await deleteProductImage(uploadedImage.key).catch(() => null);
    }
    throw error;
  }
};

const deleteProduct = async (productId) => {
  ensureObjectId(productId);

  const product = await Product.findById(productId);

  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  await Product.deleteOne({ _id: productId });
  await deleteProductImage(product.imageKey).catch(() => null);

  return product;
};

module.exports = {
  createProduct,
  listProducts,
  getProductDetail,
  updateProduct,
  deleteProduct,
};
