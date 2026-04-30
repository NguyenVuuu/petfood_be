const Category = require("../models/Category");

const findAll = async (filter = {}, sort = { menuOrder: 1, name: 1 }) =>
  Category.find(filter).sort(sort).lean();

const findActive = async () =>
  Category.find({ isActive: true }).sort({ menuOrder: 1, name: 1 }).lean();

const findById = async (id) => Category.findById(id);

const findBySlug = async (slug) => Category.findOne({ slug, isActive: true }).lean();

const findOneBySlug = async (slug, excludeId = null) =>
  Category.findOne({
    slug,
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  }).lean();

const create = async (payload) => Category.create(payload);

const updateById = async (id, payload, options = { new: true }) =>
  Category.findByIdAndUpdate(id, payload, options);

const findChildrenByParentId = async (parentId) =>
  Category.find({ parentId, isActive: true }).sort({ menuOrder: 1, name: 1 }).lean();

const findDescendantsByPathPrefix = async (pathPrefix) =>
  Category.find({ path: { $regex: `^${pathPrefix}/` } }).sort({ path: 1 }).lean();

const bulkWrite = async (operations) => Category.bulkWrite(operations);

const softDeleteById = async (id) =>
  Category.findByIdAndUpdate(id, { isActive: false }, { new: true });

const listFlat = async ({ page, limit, keyword, parentId, isActive }) => {
  const filter = {};

  if (keyword) {
    filter.name = {
      $regex: keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      $options: "i",
    };
  }

  if (parentId !== undefined) {
    filter.parentId = parentId || null;
  }

  if (isActive !== undefined) {
    filter.isActive = isActive;
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Category.find(filter).sort({ menuOrder: 1, name: 1 }).skip(skip).limit(limit).lean(),
    Category.countDocuments(filter),
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

module.exports = {
  findAll,
  findActive,
  findById,
  findBySlug,
  findOneBySlug,
  create,
  updateById,
  findChildrenByParentId,
  findDescendantsByPathPrefix,
  bulkWrite,
  softDeleteById,
  listFlat,
};
