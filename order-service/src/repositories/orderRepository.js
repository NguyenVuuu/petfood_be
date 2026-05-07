const Order = require("../models/Order");

const create = (payload) => Order.create(payload);

const findByUserId = (userId) => Order.find({ userId }).sort({ createdAt: -1 }).lean();

const findById = (orderId) => Order.findById(orderId).lean();

const findByIdForUpdate = (orderId) => Order.findById(orderId);

const findAll = ({ status, page, limit }) => {
  const filter = status ? { status } : {};
  const skip = (page - 1) * limit;

  return Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments(filter),
  ]);
};

module.exports = {
  create,
  findByUserId,
  findById,
  findByIdForUpdate,
  findAll,
};
