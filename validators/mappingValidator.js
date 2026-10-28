
const { body, validationResult } = require("express-validator");

const validateMapping = (req, res, next) => {
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

const createMappingValidation = [
  body("patientId")
    .isInt({ min: 1 })
    .withMessage("patientId must be a positive integer")
    .toInt(),

  body("doctorId")
    .isInt({ min: 1 })
    .withMessage("doctorId must be a positive integer")
    .toInt(),

  validateMapping,
];

module.exports = { createMappingValidation };
