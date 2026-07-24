// Small, dependency-free helper functions shared across components

export const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatFileSize = (bytes) => {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const dataURLToFile = (dataUrl, filename) => {
  const [meta, base64] = dataUrl.split(",");
  const mime = meta.match(/:(.*?);/)[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new File([bytes], filename, { type: mime });
};

// Turns a layout id like "2x2" or "3x3" into an evenly spaced grid of
// frame placeholders sized to fit the given canvas dimensions.
export const generateFramesForLayout = (layoutId, canvasWidth = 1200, canvasHeight = 1600) => {
  if (!layoutId) return [];

  const [colsStr, rowsStr] = layoutId.split("x");
  const cols = parseInt(colsStr, 10) || 2;
  const rows = parseInt(rowsStr, 10) || 2;

  const margin = 40;
  const gap = 20;
  const cellWidth = (canvasWidth - margin * 2 - gap * (cols - 1)) / cols;
  const cellHeight = (canvasHeight - margin * 2 - gap * (rows - 1)) / rows;

  const frames = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      frames.push({
        id: `frame-${row}-${col}`,
        x: margin + col * (cellWidth + gap),
        y: margin + row * (cellHeight + gap),
        width: cellWidth,
        height: cellHeight,
        image: null,
      });
    }
  }
  return frames;
};

export const downloadFileFromUrl = (url, filename) => {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || "download";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
