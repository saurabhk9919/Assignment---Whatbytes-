
const prisma = require("../config/prisma");

// POST /api/patients/
const createPatient = async (req, res, next) => {
  try {
    const { name, age, gender, address, phone } = req.body;

    const patient = await prisma.patient.create({
      data: {
        name,
        age,
        gender,
        address,
        phone,
        userId: req.user.userId,
      },
    });

    res.status(201).json({
      message: "Patient created successfully",
      patient,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/patients/
const getPatients = async (req, res, next) => {
  try {
    const patients = await prisma.patient.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ patients });
  } catch (error) {
    next(error);
  }
};

// GET /api/patients/:id/
const getPatientById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid patient ID" });
    }

    const patient = await prisma.patient.findFirst({
      where: {
        id,
        userId: req.user.userId,
      },
    });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.status(200).json({ patient });
  } catch (error) {
    next(error);
  }
};

// PUT /api/patients/:id/
const updatePatient = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid patient ID" });
    }

    const { name, age, gender, address, phone } = req.body;
    const existingPatient = await prisma.patient.findFirst({
      where: { id, userId: req.user.userId },
    });

    if (!existingPatient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const patient = await prisma.patient.update({
      where: { id },
      data: { name, age, gender, address, phone },
    });

    res.status(200).json({
      message: "Patient updated successfully",
      patient,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/patients/:id/
const deletePatient = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid patient ID" });
    }

    const existingPatient = await prisma.patient.findFirst({
      where: { id, userId: req.user.userId },
    });

    if (!existingPatient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    await prisma.patient.delete({ where: { id } });

    res.status(200).json({
      message: "Patient deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
};
