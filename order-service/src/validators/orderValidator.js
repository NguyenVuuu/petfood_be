const Joi = require("joi");

const objectId = Joi.string().hex().length(24);

const orderItemSchema = Joi.object({
  productId: objectId.required(),
  name: Joi.string().trim().max(200).required(),
  price: Joi.number().min(0).required(),
  quantity: Joi.number().integer().min(1).required(),
  imageUrl: Joi.string().allow("").default(""),
});

const shippingAddressSchema = Joi.object({
  fullName: Joi.string().trim().max(120).required(),
  phone: Joi.string().trim().max(30).required(),
  address: Joi.string().trim().max(300).required(),
  city: Joi.string().trim().max(120).required(),
  note: Joi.string().trim().max(500).allow("").default(""),
});

const createOrderSchema = Joi.object({
  items: Joi.array().items(orderItemSchema).min(1).required(),
  shippingAddress: shippingAddressSchema.required(),
  paymentMethod: Joi.string().valid("cod", "bank_transfer", "momo").required(),
});

const listOrderSchema = Joi.object({
  status: Joi.string()
    .valid("pending", "processing", "shipped", "delivered", "cancelled")
    .optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid("pending", "processing", "shipped", "delivered", "cancelled")
    .optional(),
  paymentStatus: Joi.string().valid("pending", "paid", "failed", "refunded").optional(),
}).or("status", "paymentStatus");

module.exports = {
  createOrderSchema,
  listOrderSchema,
  updateOrderStatusSchema,
};
