
const prisma = require("../config/prisma");

// POST /api/mappings/
const assignDoctor = async (req, res, next) => {
  try {
    const { patientId, doctorId } = req.body;

    if (
      !Number.isInteger(patientId) ||
      !Number.isInteger(doctorId) ||
      patientId <= 0 ||
      doctorId <= 0
    ) {
      return res.status(400).json({
        message: "Valid patientId and doctorId are required",
      });
    }

    // Only allow users to assign doctors to their own patients.
    const patient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        userId: req.user.userId,
      },
    });

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    const existingMapping = await prisma.patientDoctor.findUnique({
      where: {
        patientId_doctorId: { patientId, doctorId },
      },
    });

    if (existingMapping) {
      return res.status(409).json({
        message: "Doctor is already assigned to this patient",
      });
    }

    const mapping = await prisma.patientDoctor.create({
      data: { patientId, doctorId },
      include: {
        patient: true,
        doctor: true,
      },
    });

    return res.status(201).json({
      message: "Doctor assigned to patient successfully",
      mapping,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/mappings/
const getMappings = async (req, res, next) => {
  try {
    const mappings = await prisma.patientDoctor.findMany({
      where: {
        patient: {
          userId: req.user.userId,
        },
      },
      include: {
        patient: true,
        doctor: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ mappings });
  } catch (error) {
    next(error);
  }
};

// GET /api/mappings/:patient_id/
const getPatientDoctors = async (req, res, next) => {
  try {
    const patientId = Number(req.params.patient_id);

    if (!Number.isInteger(patientId) || patientId <= 0) {
      return res.status(400).json({
        message: "Invalid patient ID",
      });
    }

    const patient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        userId: req.user.userId,
      },
    });

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    const mappings = await prisma.patientDoctor.findMany({
      where: { patientId },
      include: { doctor: true },
    });

    return res.status(200).json({
      patientId,
      doctors: mappings.map((mapping) => mapping.doctor),
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/mappings/:id/
const removeMapping = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid mapping ID",
      });
    }

    const mapping = await prisma.patientDoctor.findFirst({
      where: {
        id,
        patient: {
          userId: req.user.userId,
        },
      },
    });

    if (!mapping) {
      return res.status(404).json({
        message: "Mapping not found",
      });
    }

    await prisma.patientDoctor.delete({
      where: { id },
    });

    return res.status(200).json({
      message: "Doctor assignment removed successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  assignDoctor,
  getMappings,
  getPatientDoctors,
  removeMapping,
};
