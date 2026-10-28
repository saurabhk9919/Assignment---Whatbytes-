
const prisma = require("../config/prisma");

// POST /api/doctors/
const createDoctor = async (req, res, next) => {
  try {
    const { name, specialization, email, phone } = req.body;

    const doctor = await prisma.doctor.create({
      data: {
        name,
        specialization,
        email: email || null,
        phone,
      },
    });

    return res.status(201).json({
      message: "Doctor created successfully",
      doctor,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/doctors/
const getDoctors = async (req, res, next) => {
  try {
    const doctors = await prisma.doctor.findMany({
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ doctors });
  } catch (error) {
    next(error);
  }
};

// GET /api/doctors/:id/
const getDoctorById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid doctor ID",
      });
    }

    const doctor = await prisma.doctor.findUnique({
      where: { id },
    });

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    return res.status(200).json({ doctor });
  } catch (error) {
    next(error);
  }
};

// PUT /api/doctors/:id/
const updateDoctor = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid doctor ID",
      });
    }

    const { name, specialization, email, phone } = req.body;

    const existingDoctor = await prisma.doctor.findUnique({
      where: { id },
    });

    if (!existingDoctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    const data = {};

    if (name !== undefined) data.name = name;
    if (specialization !== undefined) data.specialization = specialization;
    if (email !== undefined) data.email = email || null;
    if (phone !== undefined) data.phone = phone;

    const doctor = await prisma.doctor.update({
      where: { id },
      data,
    });

    return res.status(200).json({
      message: "Doctor updated successfully",
      doctor,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/doctors/:id/
const deleteDoctor = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid doctor ID",
      });
    }

    const existingDoctor = await prisma.doctor.findUnique({
      where: { id },
    });

    if (!existingDoctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    await prisma.doctor.delete({
      where: { id },
    });

    return res.status(200).json({
      message: "Doctor deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
};
