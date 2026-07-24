// Centralized constants used across the Photobox app

export const API_BASE_URL = "/api";

export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10MB
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export const LAYOUTS = [
  { id: "1x2", label: "2 Foto", frames: 2 },
  { id: "2x2", label: "4 Foto", frames: 4 },
  { id: "3x2", label: "6 Foto", frames: 6 },
  { id: "3x3", label: "8 Foto", frames: 8 },
  { id: "3x3-full", label: "9 Foto", frames: 9 },
];

export const FILTER_PRESETS = [
  "original",
  "vintage",
  "warm",
  "cool",
  "vivid",
  "sepia",
  "grayscale",
];

export const TEMPLATE_CATEGORIES = [
  { id: "all", label: "Semua" },
  { id: "korean", label: "Korean Style" },
  { id: "vintage", label: "Vintage" },
  { id: "polaroid", label: "Polaroid" },
  { id: "minimalist", label: "Minimalist" },
  { id: "cute", label: "Cute" },
  { id: "floral", label: "Floral" },
  { id: "birthday", label: "Birthday" },
  { id: "wedding", label: "Wedding" },
  { id: "summer", label: "Summer" },
];

export const STICKERS = [
  "✨", "💖", "🌸", "⭐", "🎀", "🌈", "🎉", "☁️",
  "🐻", "🦋", "🍓", "🌙", "🔥", "💫", "🌻", "🎈",
];

export const DOWNLOAD_FORMATS = [
  { id: "png", label: "PNG", extension: "png" },
  { id: "jpg", label: "JPG", extension: "jpg" },
  { id: "pdf", label: "PDF (300 DPI)", extension: "pdf" },
];

// --- Photobooth (Ambil Foto) ---

export const SHOT_COUNT_OPTIONS = [3, 4, 5, 6, 7, 8, 9, 10];

// Curated grid dimensions per shot count so the composed result always
// looks intentional (mostly clean 2-column strips, like a real photobox).
export const PHOTOBOOTH_GRID = {
  3: { cols: 1, rows: 3 },
  4: { cols: 2, rows: 2 },
  5: { cols: 2, rows: 3 },
  6: { cols: 2, rows: 3 },
  7: { cols: 2, rows: 4 },
  8: { cols: 2, rows: 4 },
  9: { cols: 3, rows: 3 },
  10: { cols: 2, rows: 5 },
};

export const BACKGROUND_PRESETS = [
  { id: "peach", label: "Peach", colors: ["#ffe4d6", "#ffd3c4"] },
  { id: "maroon-check", label: "Maroon Check", colors: ["#7a1f2b", "#4a1118"], pattern: "check" },
  { id: "mustard", label: "Mustard Grid", colors: ["#f5b942", "#e29a1f"], pattern: "grid" },
  { id: "cocoa", label: "Cocoa Paper", colors: ["#8a6b52", "#5c4632"] },
  { id: "noir", label: "Film Noir", colors: ["#141414", "#2b2b2b"] },
  { id: "cream", label: "Cream", colors: ["#fdfaf3", "#f3ead9"] },
  { id: "cow", label: "Cow Print", colors: ["#101010", "#f4f4f4"], pattern: "spots" },
  { id: "lavender", label: "Lavender Dream", colors: ["#ede9fe", "#f9a8d4"] },
  { id: "sunset", label: "Sunset", colors: ["#f97316", "#ec4899"] },
  { id: "ocean", label: "Ocean", colors: ["#06b6d4", "#6366f1"] },
];
