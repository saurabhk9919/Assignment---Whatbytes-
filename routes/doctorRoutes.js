
const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");

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
  .post(createDoctor)
  .get(getDoctors);

router.route("/:id/")
  .get(getDoctorById)
  .put(updateDoctor)
  .delete(deleteDoctor);

module.exports = router;
