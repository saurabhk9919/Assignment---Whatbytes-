require("dotenv").config();

const express = require("express");
const prisma = require("./config/prisma");

const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const mappingRoutes = require("./routes/mappingRoutes");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Healthcare API is running",
  });
});

app.use("/api/auth", authRoutes);

app.use("/api/patients", patientRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/mappings", mappingRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

app.use((err, req, res, next) => {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  if (err.code === "P2002") {
    return res.status(409).json({
      message: "A record with this unique value already exists",
    });
  }

  if (err.code === "P2025") {
    return res.status(404).json({
      message: "Record not found",
    });
  }

  res.status(500).json({
    message: "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT);

server.once("listening", () => {
  console.log(`Healthcare API running on port ${PORT}`);
});

server.once("error", (err) => {
  console.error(`Unable to start Healthcare API on port ${PORT}:`, err.message);
  process.exitCode = 1;
});

async function shutdown() {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);