
const { body, validationResult } = require("express-validator");

const validatePatient = (req, res, next) => {
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

const createPatientValidation = [
  body("name")
    .isString()
    .withMessage("Name must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Patient name is required"),

  body("age")
    .optional()
    .isInt({ min: 0, max: 130 })
    .withMessage("Age must be an integer between 0 and 130")
    .toInt(),

  body("gender")
    .optional()
    .isString()
    .withMessage("Gender must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Gender cannot be empty"),

  body("address")
    .optional()
    .isString()
    .withMessage("Address must be a string")
    .bail()
    .trim(),

  body("phone")
    .optional()
    .isString()
    .withMessage("Phone must be a string")
    .bail()
    .trim(),

  validatePatient,
];

const updatePatientValidation = [
  body("name")
    .optional()
    .isString()
    .withMessage("Name must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty"),

  body("age")
    .optional()
    .isInt({ min: 0, max: 130 })
    .withMessage("Age must be an integer between 0 and 130")
    .toInt(),

  body("gender")
    .optional()
    .isString()
    .withMessage("Gender must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Gender cannot be empty"),

  body("address")
    .optional()
    .isString()
    .withMessage("Address must be a string")
    .bail()
    .trim(),

  body("phone")
    .optional()
    .isString()
    .withMessage("Phone must be a string")
    .bail()
    .trim(),

  validatePatient,
];

module.exports = {
  createPatientValidation,
  updatePatientValidation,
};
