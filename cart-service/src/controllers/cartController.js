const cartService = require("../services/cartService");
const {
  addItemSchema,
  updateItemQuantitySchema,
  mergeCartSchema,
} = require("../validators/cartValidator");

const getCart = async (req, res, next) => {
  try {
    const cart = await cartService.getCart(req.cartOwner);
    return res.status(200).json({ cart });
  } catch (error) {
    return next(error);
  }
};

const addItem = async (req, res, next) => {
  try {
    const payload = await addItemSchema.validateAsync(req.body, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    const cart = await cartService.addItem(req.cartOwner, payload);

    return res.status(200).json({
      message: "Add item successful",
      cart,
    });
  } catch (error) {
    return next(error);
  }
};

const updateItemQuantity = async (req, res, next) => {
  try {
    const payload = await updateItemQuantitySchema.validateAsync(req.body, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    const cart = await cartService.updateItemQuantity(
      req.cartOwner,
      req.params.productId,
      payload.quantity
    );

    return res.status(200).json({
      message: "Update item quantity successful",
      cart,
    });
  } catch (error) {
    return next(error);
  }
};

const removeItem = async (req, res, next) => {
  try {
    const cart = await cartService.removeItem(req.cartOwner, req.params.productId);

    return res.status(200).json({
      message: "Remove item successful",
      cart,
    });
  } catch (error) {
    return next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const cart = await cartService.clearCart(req.cartOwner);

    return res.status(200).json({
      message: "Clear cart successful",
      cart,
    });
  } catch (error) {
    return next(error);
  }
};

const validateCart = async (req, res, next) => {
  try {
    const result = await cartService.validateCart(req.cartOwner);

    return res.status(200).json({
      message: "Validate cart successful",
      ...result,
    });
  } catch (error) {
    return next(error);
  }
};

const mergeCart = async (req, res, next) => {
  try {
    const payload = await mergeCartSchema.validateAsync(req.body, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    const cart = await cartService.mergeGuestCart({
      userId: req.auth.sub,
      guestToken: payload.guestToken,
    });

    return res.status(200).json({
      message: "Merge cart successful",
      cart,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getCart,
  addItem,
  updateItemQuantity,
  removeItem,
  clearCart,
  validateCart,
  mergeCart,
};
