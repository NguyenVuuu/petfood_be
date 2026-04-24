const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const sessionRepository = require("../repositories/sessionRepository");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  refreshTokenExpiryMs,
} = require("../utils/token");
const userClient = require("./userClient");

const createSession = async (userId) => {
  const refreshToken = signRefreshToken(userId);
  const expiresAt = new Date(Date.now() + refreshTokenExpiryMs());

  await sessionRepository.create({ userId, refreshToken, expiresAt });

  return refreshToken;
};

const normalizeUser = (user) => ({
  id: String(user.id || user._id),
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const register = async ({ fullName, email, password }) => {
  const user = await userClient.createUser({ fullName, email, password });

  const accessToken = signAccessToken(user);
  const refreshToken = await createSession(user.id);

  return { accessToken, refreshToken, user: normalizeUser(user) };
};

const login = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase();

  let user;
  try {
    user = await userClient.getUserByEmail(normalizedEmail);
  } catch (error) {
    if (error.statusCode === 404) {
      const authError = new Error("Invalid email or password");
      authError.statusCode = 401;
      throw authError;
    }
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const accessToken = signAccessToken(user);
  const refreshToken = await createSession(user.id);

  return { accessToken, refreshToken, user: normalizeUser(user) };
};

const getProfile = async (userId) => {
  const user = await userClient.getUserById(userId);
  return normalizeUser(user);
};

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

  const session = await sessionRepository.findOneAndDelete({
    refreshToken: oldRefreshToken,
  });

  if (!session) {
    const error = new Error("Session not found or already revoked");
    error.statusCode = 401;
    throw error;
  }

  const user = await userClient.getUserById(payload.sub);

  const accessToken = signAccessToken(user);
  const newRefreshToken = await createSession(user.id);

  return { accessToken, refreshToken: newRefreshToken };
};

const logout = async (refreshToken) => {
  if (refreshToken) {
    await sessionRepository.findOneAndDelete({ refreshToken });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  refresh,
  logout,
};
