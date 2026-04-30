const Joi = require("joi");

const objectIdPattern = /^[a-f\d]{24}$/i;

const createCategorySchema = Joi.object({
  name: Joi.string().trim().max(150).required(),
  parentId: Joi.string().trim().pattern(objectIdPattern).allow(null, ""),
  menuGroup: Joi.string().trim().allow("").max(120).default(""),
  menuOrder: Joi.number().integer().default(0),
  isActive: Joi.boolean().default(true),
});

const updateCategorySchema = Joi.object({
  name: Joi.string().trim().max(150),
  parentId: Joi.string().trim().pattern(objectIdPattern).allow(null, ""),
  menuGroup: Joi.string().trim().allow("").max(120),
  menuOrder: Joi.number().integer(),
  isActive: Joi.boolean(),
}).min(1);

const listCategoriesSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  keyword: Joi.string().trim().allow(""),
  parentId: Joi.string().trim().pattern(objectIdPattern).allow("", null),
  isActive: Joi.boolean(),
});

module.exports = {
  createCategorySchema,
  updateCategorySchema,
  listCategoriesSchema,
};
