const resolveCartOwner = (req, res, next) => {
  const guestToken = req.header("x-cart-token")?.trim();
  const userId = req.auth?.sub;

  if (userId) {
    req.cartOwner = {
      ownerType: "user",
      userId,
      guestToken: null,
    };
    return next();
  }

  if (guestToken) {
    req.cartOwner = {
      ownerType: "guest",
      userId: null,
      guestToken,
    };
    return next();
  }

  return res.status(400).json({
    message: "Missing cart identity: provide Bearer token or x-cart-token",
  });
};

module.exports = {
  resolveCartOwner,
};
