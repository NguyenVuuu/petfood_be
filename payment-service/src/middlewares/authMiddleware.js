const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/env");

const requireUserAuth = (req, res, next) => {
  const authorizationHeader = req.headers.authorization || "";
  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      message: "Missing or invalid authorization header",
    });
  }

  try {
    req.auth = jwt.verify(token, jwtSecret);
    return next();
  } catch (_error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

module.exports = { requireUserAuth };
