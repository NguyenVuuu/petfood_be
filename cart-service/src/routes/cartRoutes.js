const express = require("express");
const cartController = require("../controllers/cartController");
const { optionalAuth, requireUserAuth } = require("../middlewares/authMiddleware");
const { resolveCartOwner } = require("../middlewares/cartOwnerMiddleware");

const router = express.Router();

router.use(optionalAuth);

router.get("/", resolveCartOwner, cartController.getCart);
router.post("/items", resolveCartOwner, cartController.addItem);
router.patch("/items/:productId", resolveCartOwner, cartController.updateItemQuantity);
router.delete("/items/:productId", resolveCartOwner, cartController.removeItem);
router.delete("/", resolveCartOwner, cartController.clearCart);
router.post("/validate", resolveCartOwner, cartController.validateCart);
router.post("/merge", requireUserAuth, cartController.mergeCart);

module.exports = router;
