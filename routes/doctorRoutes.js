
const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const {
  createDoctorValidation,
  updateDoctorValidation,
} = require("../validators/doctorValidator");

const {
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
} = require("../controllers/doctorController");

const router = express.Router();

router.use(authenticateToken);

router.route("/")
  .post(createDoctorValidation, createDoctor)
  .get(getDoctors);

router.route("/:id/")
  .get(getDoctorById)
  .put(updateDoctorValidation, updateDoctor)
  .delete(deleteDoctor);

module.exports = router;
