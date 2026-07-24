const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs-extra");
const uploadRoutes = require("./routes/upload");
const editRoutes = require("./routes/edit");
const templateRoutes = require("./routes/template");
const downloadRoutes = require("./routes/download");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/results", express.static(path.join(__dirname, "uploads/results")));

// Ensure upload directories exist
const uploadDirs = [
  "uploads",
  "uploads/projects",
  "uploads/results",
  "uploads/temp",
];
uploadDirs.forEach((dir) => {
  fs.ensureDirSync(path.join(__dirname, dir));
});

// Routes
app.use("/api/upload", uploadRoutes);
app.use("/api/edit", editRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/download", downloadRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Photobox API is running",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Photobox backend running on port ${PORT}`);
  console.log(`📁 Upload directory: ${path.join(__dirname, "uploads")}`);
});
