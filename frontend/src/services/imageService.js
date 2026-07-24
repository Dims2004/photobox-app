// Thin wrapper around the backend image-editing endpoints, kept separate
// from api.js so editor components can call semantic actions like
// imageService.crop(...) without worrying about request shapes.

import { cropImage, resizeImage, rotateImage, applyFilter } from "./api";

export const crop = (imageUrl, cropData) =>
  cropImage({ imageUrl, cropData });

export const resize = (imageUrl, width, height, fit = "contain") =>
  resizeImage({ imageUrl, width, height, fit });

export const rotate = (imageUrl, angle) => rotateImage({ imageUrl, angle });

export const filter = (imageUrl, filterType, intensity = 100) =>
  applyFilter({ imageUrl, filterType, intensity });

export const getImageDimensions = (file) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(url);
    };
    img.onerror = reject;
    img.src = url;
  });

export const fileToDataURL = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default { crop, resize, rotate, filter, getImageDimensions, fileToDataURL };
