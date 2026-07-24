const express = require("express");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs-extra");
const sharp = require("sharp");
const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads/projects");
    fs.ensureDirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.",
      ),
      false,
    );
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter,
});

// Upload image
router.post("/image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No image uploaded" });
    }

    const filePath = req.file.path;
    const fileUrl = `/uploads/projects/${req.file.filename}`;

    // Get image metadata
    const metadata = await sharp(filePath).metadata();

    res.json({
      success: true,
      data: {
        id: req.file.filename,
        url: fileUrl,
        path: filePath,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    res
      .status(500)
      .json({ success: false, message: "Upload failed", error: error.message });
  }
});

// Upload multiple images
router.post("/images", upload.array("images", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No images uploaded" });
    }

    const uploadedFiles = await Promise.all(
      req.files.map(async (file) => {
        const metadata = await sharp(file.path).metadata();
        return {
          id: file.filename,
          url: `/uploads/projects/${file.filename}`,
          path: file.path,
          filename: file.filename,
          originalName: file.originalname,
          size: file.size,
          width: metadata.width,
          height: metadata.height,
          format: metadata.format,
        };
      }),
    );

    res.json({
      success: true,
      data: uploadedFiles,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res
      .status(500)
      .json({ success: false, message: "Upload failed", error: error.message });
  }
});

// Delete uploaded image
router.delete("/image/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, "../uploads/projects", filename);

    if (await fs.pathExists(filePath)) {
      await fs.remove(filePath);
      res.json({ success: true, message: "Image deleted successfully" });
    } else {
      res.status(404).json({ success: false, message: "Image not found" });
    }
  } catch (error) {
    console.error("Delete error:", error);
    res
      .status(500)
      .json({ success: false, message: "Delete failed", error: error.message });
  }
});

module.exports = router;
