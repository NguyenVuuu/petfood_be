const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const userRepository = require("../repositories/userRepository");
const { bcryptSaltRounds } = require("../config/env");

const ensureObjectId = (id) => {
  if (!mongoose.isValidObjectId(id)) {
    const error = new Error("Invalid user id");
    error.statusCode = 400;
    throw error;
  }
};

const formatUser = (user, includePassword = false) => {
  const payload = {
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  if (includePassword) {
    payload.password = user.password;
  }

  return payload;
};

const getActiveUserById = async (userId) => {
  ensureObjectId(userId);

  const user = await userRepository.findById(userId);

  if (!user || !user.isActive) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

const createUser = async ({ fullName, email, password, role }) => {
  const normalizedEmail = email.toLowerCase();

  const existingUser = await userRepository.findByEmail(normalizedEmail);

  if (existingUser) {
    const error = new Error("Email already exists");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, bcryptSaltRounds);

  const user = await userRepository.create({
    fullName,
    email: normalizedEmail,
    password: hashedPassword,
    role: role || "user",
    isActive: true,
    avatarUrl: "",
  });

  return formatUser(user);
};

const getProfile = async (userId) => {
  const user = await getActiveUserById(userId);
  return formatUser(user);
};

const getByEmailForAuth = async (email) => {
  const normalizedEmail = email.toLowerCase();

  const user = await userRepository.findByEmail(normalizedEmail);

  if (!user || !user.isActive) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return formatUser(user, true);
};

const updateProfile = async (userId, payload) => {
  const user = await getActiveUserById(userId);

  if (payload.fullName !== undefined) {
    user.fullName = payload.fullName;
  }

  if (payload.avatarUrl !== undefined) {
    user.avatarUrl = payload.avatarUrl || "";
  }

  await user.save();

  return formatUser(user);
};

const changePassword = async (userId, { oldPassword, newPassword }) => {
  const user = await getActiveUserById(userId);

  const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isOldPasswordValid) {
    const error = new Error("Old password is incorrect");
    error.statusCode = 400;
    throw error;
  }

  user.password = await bcrypt.hash(newPassword, bcryptSaltRounds);
  await user.save();

  return formatUser(user);
};

const listUsers = async ({ page, limit, email }) => {
  const data = await userRepository.listUsers({ page, limit, email });

  return {
    items: data.items.map((item) => formatUser(item)),
    meta: data.meta,
  };
};

const updateRole = async (userId, role) => {
  const user = await getActiveUserById(userId);

  user.role = role;
  await user.save();

  return formatUser(user);
};

const restoreUser = async (userId) => {
  ensureObjectId(userId);

  const user = await userRepository.findById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  user.isActive = true;
  await user.save();

  return formatUser(user);
};

module.exports = {
  createUser,
  getProfile,
  getByEmailForAuth,
  updateProfile,
  changePassword,
  listUsers,
  updateRole,
  restoreUser,
};
