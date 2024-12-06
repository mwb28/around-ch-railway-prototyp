/* wird vorläfig im Fontend direkt validiert!*/

const { check, validationResult } = require("express-validator");

const validateRegister = [
  check("name").not().isEmpty().withMessage("Name is required"),
  check("email").isEmail().withMessage("Valid email is required"),
  check("password")
    .isLength({ min: 10 })
    .withMessage("Password must be at least 10 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[\W_]/)
    .withMessage("Password must contain at least one special character"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateLogin = [
  check("email").isEmail().withMessage("Valid email is required"),
  check("password").not().isEmpty().withMessage("Password is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = {
  validateRegister,
  validateLogin,
};
