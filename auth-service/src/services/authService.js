const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Session = require("../models/Session");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  refreshTokenExpiryMs,
} = require("../utils/token");
const { formatUser } = require("../utils/formatUser");

/** Tạo session mới và lưu refreshToken vào DB */
const createSession = async (userId) => {
  const refreshToken = signRefreshToken(userId);
  const expiresAt = new Date(Date.now() + refreshTokenExpiryMs());

  await Session.create({ userId, refreshToken, expiresAt });

  return refreshToken;
};

const register = async ({ fullName, email, password }) => {
  const normalizedEmail = email.toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    const error = new Error("Email already exists");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    fullName,
    email: normalizedEmail,
    password: hashedPassword,
  });

  const accessToken = signAccessToken(user);
  const refreshToken = await createSession(user._id);

  return { accessToken, refreshToken, user: formatUser(user) };
};

const login = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const accessToken = signAccessToken(user);
  const refreshToken = await createSession(user._id);

  return { accessToken, refreshToken, user: formatUser(user) };
};

const getProfile = async (userId) => {
  const user = await User.findById(userId).select("-password");

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return formatUser(user);
};

/**
 * Refresh token rotation:
 * - Xác thực refreshToken cũ
 * - Tìm và xóa session cũ trong DB
 * - Tạo session mới với refreshToken mới
 * - Trả về accessToken mới + refreshToken mới
 */
const refresh = async (oldRefreshToken) => {
  if (!oldRefreshToken) {
    const error = new Error("Refresh token not found");
    error.statusCode = 401;
    throw error;
  }

  let payload;
  try {
    payload = verifyRefreshToken(oldRefreshToken);
  } catch {
    const error = new Error("Invalid or expired refresh token");
    error.statusCode = 401;
    throw error;
  }

  const session = await Session.findOneAndDelete({
    refreshToken: oldRefreshToken,
  });

  if (!session) {
    const error = new Error("Session not found or already revoked");
    error.statusCode = 401;
    throw error;
  }

  const user = await User.findById(payload.sub).select("-password");

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 401;
    throw error;
  }

  const accessToken = signAccessToken(user);
  const newRefreshToken = await createSession(user._id);

  return { accessToken, refreshToken: newRefreshToken };
};

/** Xóa session khỏi DB khi logout */
const logout = async (refreshToken) => {
  if (refreshToken) {
    await Session.findOneAndDelete({ refreshToken });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  refresh,
  logout,
};
