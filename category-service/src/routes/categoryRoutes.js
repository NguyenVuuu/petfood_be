const express = require("express");
const categoryController = require("../controllers/categoryController");

const router = express.Router();

router.get("/", categoryController.listCategories);
router.get("/menu", categoryController.getMenu);
router.get("/tree", categoryController.getTree);
router.get("/slug/:slug", categoryController.getBySlug);
router.get("/:id", categoryController.getById);
router.post("/", categoryController.create);
router.patch("/:id", categoryController.update);
router.delete("/:id", categoryController.softDelete);

module.exports = router;
