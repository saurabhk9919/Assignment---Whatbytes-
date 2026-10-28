
const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");

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
  .post(createPatient)
  .get(getPatients);

router.route("/:id/")
  .get(getPatientById)
  .put(updatePatient)
  .delete(deletePatient);

module.exports = router;
