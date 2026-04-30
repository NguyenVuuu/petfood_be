const Joi = require("joi");

const objectIdPattern = /^[a-f\d]{24}$/i;

const addItemSchema = Joi.object({
  productId: Joi.string().trim().pattern(objectIdPattern).required(),
  quantity: Joi.number().integer().min(1).default(1),
});

const updateItemQuantitySchema = Joi.object({
  quantity: Joi.number().integer().min(1).required(),
});

const mergeCartSchema = Joi.object({
  guestToken: Joi.string().trim().min(10).max(200).required(),
});

module.exports = {
  addItemSchema,
  updateItemQuantitySchema,
  mergeCartSchema,
};
