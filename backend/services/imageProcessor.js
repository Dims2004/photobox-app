const sharp = require("sharp");
const path = require("path");
const fs = require("fs-extra");

class ImageProcessor {
  constructor() {
    this.supportedFormats = ["jpeg", "png", "webp", "gif", "tiff"];
  }

  async processImage(inputPath, options = {}) {
    try {
      let sharpInstance = sharp(inputPath);

      // Apply transformations
      if (options.resize) {
        sharpInstance = sharpInstance.resize(
          options.resize.width,
          options.resize.height,
          {
            fit: options.resize.fit || "contain",
            position: options.resize.position || "center",
          },
        );
      }

      if (options.crop) {
        sharpInstance = sharpInstance.extract({
          left: options.crop.x || 0,
          top: options.crop.y || 0,
          width: options.crop.width,
          height: options.crop.height,
        });
      }

      if (options.rotate) {
        sharpInstance = sharpInstance.rotate(options.rotate);
      }

      if (options.flip) {
        sharpInstance = sharpInstance.flip();
      }

      if (options.flop) {
        sharpInstance = sharpInstance.flop();
      }

      if (options.grayscale) {
        sharpInstance = sharpInstance.grayscale();
      }

      if (options.blur) {
        sharpInstance = sharpInstance.blur(options.blur);
      }

      if (options.sharpen) {
        sharpInstance = sharpInstance.sharpen(options.sharpen);
      }

      if (options.modulate) {
        sharpInstance = sharpInstance.modulate(options.modulate);
      }

      if (options.format) {
        sharpInstance = sharpInstance.toFormat(options.format);
      }

      if (options.quality) {
        sharpInstance = sharpInstance.jpeg({ quality: options.quality });
      }

      return sharpInstance;
    } catch (error) {
      throw new Error(`Image processing failed: ${error.message}`);
    }
  }

  async composeImages(composites, outputPath, options = {}) {
    try {
      const { width = 1200, height = 1600, background = "#FFFFFF" } = options;

      let sharpInstance = sharp({
        create: {
          width: width,
          height: height,
          channels: 4,
          background: background,
        },
      });

      // Process each composite
      const processedComposites = await Promise.all(
        composites.map(async (composite) => {
          const imagePath = composite.imagePath || composite.input;

          if (!(await fs.pathExists(imagePath))) {
            throw new Error(`Image not found: ${imagePath}`);
          }

          const image = sharp(imagePath);
          const metadata = await image.metadata();

          // Calculate positioning
          const x = composite.x || 0;
          const y = composite.y || 0;
          const w = composite.width || metadata.width;
          const h = composite.height || metadata.height;

          return {
            input: imagePath,
            left: Math.round(x),
            top: Math.round(y),
            width: Math.round(w),
            height: Math.round(h),
            blend: composite.blend || "over",
            gravity: composite.gravity || "northwest",
          };
        }),
      );

      // Apply composites
      if (processedComposites.length > 0) {
        sharpInstance = sharpInstance.composite(processedComposites);
      }

      // Save the result
      await sharpInstance.toFile(outputPath);

      return outputPath;
    } catch (error) {
      throw new Error(`Image composition failed: ${error.message}`);
    }
  }

  async createThumbnail(inputPath, outputPath, size = 200) {
    try {
      await sharp(inputPath)
        .resize(size, size, {
          fit: "cover",
          position: "center",
        })
        .toFile(outputPath);

      return outputPath;
    } catch (error) {
      throw new Error(`Thumbnail creation failed: ${error.message}`);
    }
  }

  async getImageMetadata(inputPath) {
    try {
      const metadata = await sharp(inputPath).metadata();
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: metadata.size,
        channels: metadata.channels,
        space: metadata.space,
      };
    } catch (error) {
      throw new Error(`Failed to get image metadata: ${error.message}`);
    }
  }

  async applyFilter(inputPath, filterType, intensity = 100) {
    try {
      let sharpInstance = sharp(inputPath);

      switch (filterType) {
        case "grayscale":
          sharpInstance = sharpInstance.grayscale();
          break;
        case "sepia":
          sharpInstance = sharpInstance.modulate({
            saturation: 0.5,
            brightness: 0.9,
          });
          break;
        case "vintage":
          sharpInstance = sharpInstance
            .modulate({
              saturation: 0.7,
              brightness: 0.95,
            })
            .tint("#8B7355");
          break;
        case "vivid":
          sharpInstance = sharpInstance
            .modulate({
              saturation: 1.5,
              brightness: 1.1,
            })
            .sharpen();
          break;
        case "warm":
          sharpInstance = sharpInstance
            .modulate({
              brightness: 1.05,
            })
            .tint("#FFD700");
          break;
        case "cool":
          sharpInstance = sharpInstance
            .modulate({
              brightness: 1.05,
            })
            .tint("#87CEEB");
          break;
        default:
          // No filter applied
          break;
      }

      return sharpInstance;
    } catch (error) {
      throw new Error(`Filter application failed: ${error.message}`);
    }
  }

  async optimizeImage(inputPath, outputPath, options = {}) {
    try {
      const { quality = 80, format = "jpeg", width, height } = options;

      let sharpInstance = sharp(inputPath);

      if (width || height) {
        sharpInstance = sharpInstance.resize(width, height, {
          fit: "inside",
          withoutEnlargement: true,
        });
      }

      switch (format) {
        case "jpeg":
          sharpInstance = sharpInstance.jpeg({ quality });
          break;
        case "png":
          sharpInstance = sharpInstance.png({ quality });
          break;
        case "webp":
          sharpInstance = sharpInstance.webp({ quality });
          break;
        default:
          sharpInstance = sharpInstance.jpeg({ quality });
      }

      await sharpInstance.toFile(outputPath);
      return outputPath;
    } catch (error) {
      throw new Error(`Image optimization failed: ${error.message}`);
    }
  }

  async addWatermark(inputPath, watermarkPath, outputPath, options = {}) {
    try {
      const { position = "bottom-right", opacity = 0.8, margin = 20 } = options;

      const watermark = sharp(watermarkPath);
      const metadata = await sharp(inputPath).metadata();
      const watermarkMetadata = await watermark.metadata();

      // Calculate position
      let x = 0,
        y = 0;
      const w = watermarkMetadata.width;
      const h = watermarkMetadata.height;

      switch (position) {
        case "top-left":
          x = margin;
          y = margin;
          break;
        case "top-right":
          x = metadata.width - w - margin;
          y = margin;
          break;
        case "bottom-left":
          x = margin;
          y = metadata.height - h - margin;
          break;
        case "bottom-right":
          x = metadata.width - w - margin;
          y = metadata.height - h - margin;
          break;
        case "center":
          x = (metadata.width - w) / 2;
          y = (metadata.height - h) / 2;
          break;
        default:
          x = margin;
          y = margin;
      }

      await sharp(inputPath)
        .composite([
          {
            input: watermarkPath,
            left: Math.round(x),
            top: Math.round(y),
            blend: "over",
            opacity: opacity,
          },
        ])
        .toFile(outputPath);

      return outputPath;
    } catch (error) {
      throw new Error(`Watermark addition failed: ${error.message}`);
    }
  }
}

module.exports = ImageProcessor;
