const mongoose = require("mongoose");
const orderRepository = require("../repositories/orderRepository");

const ensureObjectId = (id, message = "Invalid order id") => {
  if (!mongoose.isValidObjectId(id)) {
    const error = new Error(message);
    error.statusCode = 400;
    throw error;
  }
};

const normalizeItem = (item) => ({
  productId: item.productId,
  name: item.name,
  price: Number(item.price),
  quantity: Number(item.quantity),
  imageUrl: item.imageUrl || "",
});

const calculateTotalAmount = (items) =>
  items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);

const createOrder = async (userId, payload) => {
  ensureObjectId(userId, "Invalid user id");

  const items = payload.items.map(normalizeItem);
  const order = await orderRepository.create({
    userId,
    items,
    shippingAddress: payload.shippingAddress,
    paymentMethod: payload.paymentMethod,
    paymentStatus: payload.paymentMethod === "cod" ? "pending" : "pending",
    totalAmount: calculateTotalAmount(items),
  });

  return order.toObject();
};

const getMyOrders = async (userId) => {
  ensureObjectId(userId, "Invalid user id");
  return orderRepository.findByUserId(userId);
};

const getOrder = async (orderId, auth) => {
  ensureObjectId(orderId);

  const order = await orderRepository.findById(orderId);

  if (!order) {
    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }

  const isOwner = order.userId.toString() === auth.sub;
  const isAdmin = auth.role === "admin";

  if (!isOwner && !isAdmin) {
    const error = new Error("You do not have permission to view this order");
    error.statusCode = 403;
    throw error;
  }

  return order;
};

const listOrders = async ({ status, page, limit }) => {
  const [orders, total] = await orderRepository.findAll({ status, page, limit });

  return {
    orders,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

const updateOrderStatus = async (orderId, payload) => {
  ensureObjectId(orderId);

  const order = await orderRepository.findByIdForUpdate(orderId);

  if (!order) {
    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }

  if (payload.status !== undefined) order.status = payload.status;
  if (payload.paymentStatus !== undefined) order.paymentStatus = payload.paymentStatus;

  await order.save();
  return order.toObject();
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrder,
  listOrders,
  updateOrderStatus,
};
