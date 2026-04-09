const { registerSchema, loginSchema } = require("../validators/authValidator");
const authService = require("../services/authService");

const register = async (req, res, next) => {
  try {
    const payload = await registerSchema.validateAsync(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    const result = await authService.register(payload);

    return res.status(201).json({
      message: "Register successful",
      ...result,
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const payload = await loginSchema.validateAsync(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    const result = await authService.login(payload);

    return res.status(200).json({
      message: "Login successful",
      ...result,
    });
  } catch (error) {
    return next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.auth.sub);

    return res.status(200).json({
      user,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
  me,
};
