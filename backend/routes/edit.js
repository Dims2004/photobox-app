const express = require("express");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs-extra");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();

// Crop image
router.post("/crop", async (req, res) => {
  try {
    const { imageUrl, cropData } = req.body;
    const { x, y, width, height, aspectRatio } = cropData;

    // Extract filename from URL
    const filename = path.basename(imageUrl);
    const imagePath = path.join(__dirname, "../uploads/projects", filename);

    if (!(await fs.pathExists(imagePath))) {
      return res
        .status(404)
        .json({ success: false, message: "Image not found" });
    }

    // Process crop with sharp
    const outputFilename = `cropped-${uuidv4()}-${Date.now()}.png`;
    const outputPath = path.join(
      __dirname,
      "../uploads/projects",
      outputFilename,
    );

    await sharp(imagePath)
      .extract({
        left: Math.round(x),
        top: Math.round(y),
        width: Math.round(width),
        height: Math.round(height),
      })
      .toFile(outputPath);

    res.json({
      success: true,
      data: {
        url: `/uploads/projects/${outputFilename}`,
        filename: outputFilename,
        width: Math.round(width),
        height: Math.round(height),
      },
    });
  } catch (error) {
    console.error("Crop error:", error);
    res
      .status(500)
      .json({ success: false, message: "Crop failed", error: error.message });
  }
});

// Resize image
router.post("/resize", async (req, res) => {
  try {
    const { imageUrl, width, height, fit = "contain" } = req.body;

    const filename = path.basename(imageUrl);
    const imagePath = path.join(__dirname, "../uploads/projects", filename);

    if (!(await fs.pathExists(imagePath))) {
      return res
        .status(404)
        .json({ success: false, message: "Image not found" });
    }

    const outputFilename = `resized-${uuidv4()}-${Date.now()}.png`;
    const outputPath = path.join(
      __dirname,
      "../uploads/projects",
      outputFilename,
    );

    await sharp(imagePath)
      .resize(width, height, { fit: fit, position: "center" })
      .toFile(outputPath);

    res.json({
      success: true,
      data: {
        url: `/uploads/projects/${outputFilename}`,
        filename: outputFilename,
        width: width,
        height: height,
      },
    });
  } catch (error) {
    console.error("Resize error:", error);
    res
      .status(500)
      .json({ success: false, message: "Resize failed", error: error.message });
  }
});

// Rotate image
router.post("/rotate", async (req, res) => {
  try {
    const { imageUrl, angle } = req.body;

    const filename = path.basename(imageUrl);
    const imagePath = path.join(__dirname, "../uploads/projects", filename);

    if (!(await fs.pathExists(imagePath))) {
      return res
        .status(404)
        .json({ success: false, message: "Image not found" });
    }

    const outputFilename = `rotated-${uuidv4()}-${Date.now()}.png`;
    const outputPath = path.join(
      __dirname,
      "../uploads/projects",
      outputFilename,
    );

    await sharp(imagePath).rotate(angle).toFile(outputPath);

    res.json({
      success: true,
      data: {
        url: `/uploads/projects/${outputFilename}`,
        filename: outputFilename,
      },
    });
  } catch (error) {
    console.error("Rotate error:", error);
    res
      .status(500)
      .json({ success: false, message: "Rotate failed", error: error.message });
  }
});

// Apply filter
router.post("/filter", async (req, res) => {
  try {
    const { imageUrl, filterType, intensity = 100 } = req.body;

    const filename = path.basename(imageUrl);
    const imagePath = path.join(__dirname, "../uploads/projects", filename);

    if (!(await fs.pathExists(imagePath))) {
      return res
        .status(404)
        .json({ success: false, message: "Image not found" });
    }

    const outputFilename = `filtered-${uuidv4()}-${Date.now()}.png`;
    const outputPath = path.join(
      __dirname,
      "../uploads/projects",
      outputFilename,
    );

    let sharpInstance = sharp(imagePath);

    // Apply different filters
    switch (filterType) {
      case "grayscale":
        sharpInstance = sharpInstance.grayscale();
        break;
      case "sepia":
        sharpInstance = sharpInstance.modulate({ saturation: 0.5 });
        break;
      case "brightness":
        sharpInstance = sharpInstance.modulate({ brightness: intensity / 100 });
        break;
      case "contrast":
        sharpInstance = sharpInstance.modulate({ contrast: intensity / 100 });
        break;
      case "blur":
        sharpInstance = sharpInstance.blur(intensity / 20);
        break;
      default:
        break;
    }

    await sharpInstance.toFile(outputPath);

    res.json({
      success: true,
      data: {
        url: `/uploads/projects/${outputFilename}`,
        filename: outputFilename,
      },
    });
  } catch (error) {
    console.error("Filter error:", error);
    res
      .status(500)
      .json({ success: false, message: "Filter failed", error: error.message });
  }
});

// Compose multiple images (for photobox layout)
router.post("/compose", async (req, res) => {
  try {
    const { layout, images, template, decorations, textElements } = req.body;

    // This is a simplified version - in production, you'd use a more sophisticated composition
    // For now, we'll just process individual images

    const processedImages = [];
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const filename = path.basename(img.url);
      const imagePath = path.join(__dirname, "../uploads/projects", filename);

      if (await fs.pathExists(imagePath)) {
        processedImages.push({
          ...img,
          path: imagePath,
        });
      }
    }

    res.json({
      success: true,
      data: {
        processed: processedImages,
        layout: layout,
        template: template,
      },
    });
  } catch (error) {
    console.error("Compose error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Composition failed",
        error: error.message,
      });
  }
});

module.exports = router;
