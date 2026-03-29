require("dotenv").config();

const express = require("express");
const cors = require("cors");
const prisma = require("./config/prisma");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: "OK",
      message: "Server và Database đang chạy bình thường",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      message: "Không thể kết nối Database",
      error: error.message
    });
  }
});

// Default route
app.get("/", (req, res) => {
  res.json({ message: "API is running..." });
});

// Routes
const routes = require("./routes");
app.use("/api", routes);

// 404
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    status: err.status || 500
  });
});

module.exports = app;