const jwt = require("jsonwebtoken");
const {
  jwtSecret,
  jwtExpiresIn,
  jwtRefreshSecret,
  jwtRefreshExpiresIn,
} = require("../config/env");

const signAccessToken = (user) =>
  jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    },
    jwtSecret,
    { expiresIn: jwtExpiresIn },
  );

const signRefreshToken = (userId) =>
  jwt.sign({ sub: userId.toString() }, jwtRefreshSecret, {
    expiresIn: jwtRefreshExpiresIn,
  });

const verifyRefreshToken = (token) => jwt.verify(token, jwtRefreshSecret);

/**
 * Chuyển chuỗi thời gian như "7d", "24h", "60m", "3600s" sang milliseconds
 */
const parseExpiryMs = (expiresIn) => {
  const units = { d: 86400, h: 3600, m: 60, s: 1 };
  const match = String(expiresIn).match(/^(\d+)([dhms])$/);
  if (!match) return 7 * 86400 * 1000; // mặc định 7 ngày
  return parseInt(match[1], 10) * units[match[2]] * 1000;
};

const refreshTokenExpiryMs = () => parseExpiryMs(jwtRefreshExpiresIn);

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  refreshTokenExpiryMs,
};
