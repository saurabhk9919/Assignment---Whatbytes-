
const { body, validationResult } = require("express-validator");

const validateDoctor = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array().map(({ path, msg }) => ({
        field: path,
        message: msg,
      })),
    });
  }

  next();
};

const createDoctorValidation = [
  body("name")
    .isString()
    .withMessage("Name must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Doctor name is required"),

  body("specialization")
    .isString()
    .withMessage("Specialization must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Specialization is required"),

  body("email")
    .optional({ values: "null" })
    .isEmail()
    .withMessage("A valid email is required")
    .normalizeEmail(),

  body("phone")
    .optional()
    .isString()
    .withMessage("Phone must be a string")
    .bail()
    .trim(),

  validateDoctor,
];

const updateDoctorValidation = [
  body("name")
    .optional()
    .isString()
    .withMessage("Name must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty"),

  body("specialization")
    .optional()
    .isString()
    .withMessage("Specialization must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Specialization cannot be empty"),

  body("email")
    .optional({ values: "null" })
    .isEmail()
    .withMessage("A valid email is required")
    .normalizeEmail(),

  body("phone")
    .optional()
    .isString()
    .withMessage("Phone must be a string")
    .bail()
    .trim(),

  validateDoctor,
];

module.exports = {
  createDoctorValidation,
  updateDoctorValidation,
};
