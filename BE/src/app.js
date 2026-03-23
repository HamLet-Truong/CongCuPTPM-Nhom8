require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();

const pool = require("./database/connection");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test database connection
app.get("/health", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    res.json({ 
      status: "OK", 
      message: "Server và Database đang chạy bình thường",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Database connection error:", error);
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

// Mount routes
const routes = require("./routes");
app.use("/api", routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    status: err.status || 500
  });
});

module.exports = app;