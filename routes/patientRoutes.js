
const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const {
  createPatientValidation,
  updatePatientValidation,
} = require("../validators/patientValidator");

const {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
} = require("../controllers/patientController");

const router = express.Router();

router.use(authenticateToken);

router.route("/")
  .post(createPatientValidation, createPatient)
  .get(getPatients);

router.route("/:id/")
  .get(getPatientById)
  .put(updatePatientValidation, updatePatient)
  .delete(deletePatient);

module.exports = router;
