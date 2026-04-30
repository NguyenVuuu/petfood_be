const User = require("../models/User");

const create = async (payload) => User.create(payload);

const findById = async (id) => User.findById(id);

const findByEmail = async (email) => User.findOne({ email });

const listUsers = async ({ page, limit, email }) => {
  const filter = {};

  if (email) {
    filter.email = {
      $regex: email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      $options: "i",
    };
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
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
  create,
  findById,
  findByEmail,
  listUsers,
};
