
const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");

const {
  assignDoctor,
  getMappings,
  getPatientDoctors,
  removeMapping,
} = require("../controllers/mappingController");

const router = express.Router();

router.use(authenticateToken);

router.post("/", assignDoctor);
router.get("/", getMappings);
router.get("/:patient_id/", getPatientDoctors);
router.delete("/:id/", removeMapping);

module.exports = router;
