const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs-extra");
const { v4: uuidv4 } = require("uuid");

class QRGenerator {
  constructor() {
    this.config = {
      errorCorrectionLevel: "H",
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    };
  }

  async generateQR(data, options = {}) {
    try {
      const config = { ...this.config, ...options };

      // Generate QR code as data URL
      const qrDataUrl = await QRCode.toDataURL(data, config);

      return qrDataUrl;
    } catch (error) {
      throw new Error(`QR generation failed: ${error.message}`);
    }
  }

  async generateQRFile(data, outputPath = null, options = {}) {
    try {
      if (!outputPath) {
        const filename = `qr-${uuidv4()}-${Date.now()}.png`;
        outputPath = path.join(process.cwd(), "uploads", "results", filename);
      }

      const config = { ...this.config, ...options };

      // Generate QR code and save to file
      await QRCode.toFile(outputPath, data, config);

      return outputPath;
    } catch (error) {
      throw new Error(`QR file generation failed: ${error.message}`);
    }
  }

  async generateQRWithLogo(data, logoPath, outputPath = null, options = {}) {
    try {
      // Generate base QR code
      const baseQRPath =
        outputPath ||
        path.join(
          process.cwd(),
          "uploads",
          "temp",
          `qr-${uuidv4()}-${Date.now()}.png`,
        );
      await this.generateQRFile(data, baseQRPath, options);

      // Add logo in the center
      if (logoPath && (await fs.pathExists(logoPath))) {
        const qrImage = await this.mergeQRWithLogo(
          baseQRPath,
          logoPath,
          outputPath,
        );
        return qrImage;
      }

      return baseQRPath;
    } catch (error) {
      throw new Error(`QR with logo generation failed: ${error.message}`);
    }
  }

  async mergeQRWithLogo(qrPath, logoPath, outputPath) {
    try {
      // This would use sharp to composite the logo onto the QR code
      // For now, return the QR path
      return qrPath;
    } catch (error) {
      throw new Error(`QR with logo merge failed: ${error.message}`);
    }
  }

  async generateBulkQR(dataArray, outputDir = null) {
    try {
      const results = [];
      const baseDir =
        outputDir || path.join(process.cwd(), "uploads", "results");

      await fs.ensureDir(baseDir);

      for (const data of dataArray) {
        const filename = `qr-${uuidv4()}-${Date.now()}.png`;
        const outputPath = path.join(baseDir, filename);

        await this.generateQRFile(data, outputPath);

        results.push({
          filename,
          path: outputPath,
          data: data,
        });
      }

      return results;
    } catch (error) {
      throw new Error(`Bulk QR generation failed: ${error.message}`);
    }
  }

  validateQRData(data) {
    if (!data) {
      throw new Error("QR data is required");
    }

    // Ensure data is a string
    if (typeof data !== "string") {
      return JSON.stringify(data);
    }

    return data;
  }

  getQRConfig(options = {}) {
    return {
      ...this.config,
      ...options,
    };
  }

  async generateQRForDownload(fileUrl, filename, options = {}) {
    try {
      const data = this.validateQRData(fileUrl);
      const config = this.getQRConfig(options);

      const qrDataUrl = await this.generateQR(data, config);

      return {
        dataUrl: qrDataUrl,
        fileUrl: fileUrl,
        filename: filename,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`QR for download generation failed: ${error.message}`);
    }
  }
}

module.exports = QRGenerator;
