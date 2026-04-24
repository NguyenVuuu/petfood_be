const categoryService = require("../services/categoryService");
const {
  createCategorySchema,
  updateCategorySchema,
  listCategoriesSchema,
} = require("../validators/categoryValidator");

const listCategories = async (req, res, next) => {
  try {
    const query = await listCategoriesSchema.validateAsync(req.query, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    const data = await categoryService.listCategories(query);

    return res.status(200).json(data);
  } catch (error) {
    return next(error);
  }
};

const getMenu = async (req, res, next) => {
  try {
    const menu = await categoryService.getMenuTree();

    return res.status(200).json({ items: menu });
  } catch (error) {
    return next(error);
  }
};

const getTree = async (req, res, next) => {
  try {
    const tree = await categoryService.getCategoryTree();

    return res.status(200).json({ items: tree });
  } catch (error) {
    return next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);

    return res.status(200).json({ category });
  } catch (error) {
    return next(error);
  }
};

const getBySlug = async (req, res, next) => {
  try {
    const category = await categoryService.getCategoryBySlug(req.params.slug);

    return res.status(200).json({ category });
  } catch (error) {
    return next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const payload = await createCategorySchema.validateAsync(req.body, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    const category = await categoryService.createCategory({
      ...payload,
      parentId: payload.parentId || null,
    });

    return res.status(201).json({
      message: "Create category successful",
      category,
    });
  } catch (error) {
    return next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const payload = await updateCategorySchema.validateAsync(req.body, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    const category = await categoryService.updateCategory(req.params.id, {
      ...payload,
      ...(payload.parentId !== undefined ? { parentId: payload.parentId || null } : {}),
    });

    return res.status(200).json({
      message: "Update category successful",
      category,
    });
  } catch (error) {
    return next(error);
  }
};

const softDelete = async (req, res, next) => {
  try {
    const category = await categoryService.softDeleteCategory(req.params.id);

    return res.status(200).json({
      message: "Delete category successful",
      category,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listCategories,
  getMenu,
  getTree,
  getById,
  getBySlug,
  create,
  update,
  softDelete,
};
