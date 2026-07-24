const express = require("express");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs-extra");
const { v4: uuidv4 } = require("uuid");
const QRCode = require("qrcode");
const router = express.Router();

// Generate photobox image
router.post("/generate", async (req, res) => {
  try {
    const {
      layout,
      images,
      template,
      decorations,
      textElements,
      backgroundColor,
      width = 1200,
      height = 1600,
    } = req.body;

    // Create a blank canvas
    const outputFilename = `photobox-${uuidv4()}-${Date.now()}.png`;
    const outputPath = path.join(
      __dirname,
      "../uploads/results",
      outputFilename,
    );

    // Start with base image
    let sharpInstance = sharp({
      create: {
        width: width,
        height: height,
        channels: 4,
        background: backgroundColor || "#FFFFFF",
      },
    });

    // Process layout and place images
    // This is a simplified version - actual implementation would handle complex layouts
    const imageComposites = [];

    if (images && images.length > 0) {
      // Calculate grid positions based on layout
      const gridSize = Math.ceil(Math.sqrt(images.length));
      const cellWidth = Math.floor((width - 100) / gridSize);
      const cellHeight = Math.floor((height - 100) / gridSize);

      for (let i = 0; i < Math.min(images.length, 9); i++) {
        const img = images[i];
        if (img && img.url) {
          const imagePath = path.join(
            __dirname,
            "../uploads/projects",
            path.basename(img.url),
          );
          if (await fs.pathExists(imagePath)) {
            const row = Math.floor(i / gridSize);
            const col = i % gridSize;
            const x = 50 + col * cellWidth + 20;
            const y = 50 + row * cellHeight + 20;

            imageComposites.push({
              input: imagePath,
              left: x,
              top: y,
              width: cellWidth - 40,
              height: cellHeight - 40,
            });
          }
        }
      }
    }

    // Apply template effects and decorations
    // This is simplified - would handle more complex templates in production

    // Generate the final image
    if (imageComposites.length > 0) {
      await sharpInstance.composite(imageComposites).toFile(outputPath);
    } else {
      await sharpInstance.toFile(outputPath);
    }

    const resultUrl = `/results/${outputFilename}`;

    res.json({
      success: true,
      data: {
        url: resultUrl,
        filename: outputFilename,
        path: outputPath,
      },
    });
  } catch (error) {
    console.error("Generate image error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Image generation failed",
        error: error.message,
      });
  }
});

// Generate QR Code for download
router.post("/qrcode", async (req, res) => {
  try {
    const { fileUrl, filename } = req.body;

    // Construct full URL for the file
    const baseUrl = process.env.BASE_URL || "http://localhost:5000";
    const fullUrl = `${baseUrl}${fileUrl}`;

    // Generate QR Code
    const qrCodeDataUrl = await QRCode.toDataURL(fullUrl, {
      errorCorrectionLevel: "H",
      width: 300,
      margin: 2,
    });

    // Save QR code as image
    const qrFilename = `qr-${uuidv4()}-${Date.now()}.png`;
    const qrPath = path.join(__dirname, "../uploads/results", qrFilename);

    // Remove data URL prefix and save
    const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, "");
    await fs.writeFile(qrPath, base64Data, "base64");

    res.json({
      success: true,
      data: {
        qrCodeUrl: `/results/${qrFilename}`,
        qrCodePath: qrPath,
        fileUrl: fullUrl,
        filename: filename,
      },
    });
  } catch (error) {
    console.error("QR Code generation error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "QR Code generation failed",
        error: error.message,
      });
  }
});

// Download file
router.get("/file/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, "../uploads/results", filename);

    if (!(await fs.pathExists(filePath))) {
      return res
        .status(404)
        .json({ success: false, message: "File not found" });
    }

    res.download(filePath);
  } catch (error) {
    console.error("Download error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Download failed",
        error: error.message,
      });
  }
});

// Note: there used to be GET /history and DELETE /history/:filename
// endpoints here that listed every generated file on the server. They
// were removed on purpose: this app is used by many people, and that
// endpoint let anyone see (and delete) everyone else's generated
// photobox results, not just their own. History is now kept entirely
// client-side (see frontend/src/utils/historyStorage.js), so the
// server doesn't need to - and shouldn't - expose a shared file list.

module.exports = router;
