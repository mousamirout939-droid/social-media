const { validationResult } = require("express-validator");
const ApiError = require("../utils/ApiError");

/**
 * Runs after express-validator check chains. Collects any validation
 * errors and forwards a single ApiError to the central error handler.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const messages = errors.array().map((e) => e.msg);
  next(new ApiError(400, messages.join(", ")));
};

module.exports = validate;
