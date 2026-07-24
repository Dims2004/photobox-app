import axios from "axios";

// In local dev (docker-compose or `npm run dev`), leaving this empty
// keeps requests relative ("/api/..."), which Vite's dev proxy forwards
// to the backend container. In production, frontend and backend are
// hosted on two different domains/services (e.g. Netlify + Render), so
// we need the backend's real origin here. Set VITE_BACKEND_URL in your
// hosting provider's environment variables, e.g.
// VITE_BACKEND_URL=https://your-backend.onrender.com
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";
const API_URL = `${BACKEND_URL}/api`;

// The backend returns relative paths for uploaded/generated images (e.g.
// "/uploads/projects/xyz.png"). Those only resolve correctly when the
// frontend and backend share the same origin. This turns them into full
// URLs pointing at the backend whenever they're hosted separately, and
// leaves already-absolute URLs (http/https/data:) untouched.
export const resolveAssetUrl = (path) => {
  if (!path) return path;
  if (/^(https?:)?\/\//.test(path) || path.startsWith("data:")) return path;
  return `${BACKEND_URL}${path}`;
};

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      console.error("API Error:", error.response.data);
      return Promise.reject(error.response.data);
    }
    console.error("Network Error:", error.message);
    return Promise.reject({ message: "Network error occurred" });
  },
);

// Upload endpoints
// Note: the shared `api` instance defaults to "Content-Type: application/json"
// for convenience on regular JSON calls. For file uploads the body is a
// FormData instance, which needs a browser-generated
// "multipart/form-data; boundary=..." header instead. Setting the header
// to `undefined` here removes the JSON default for just this request, so
// axios/the browser can generate the correct boundary automatically.
export const uploadImage = (formData) => {
  return api.post("/upload/image", formData, {
    headers: { "Content-Type": undefined },
  });
};

export const uploadImages = (formData) => {
  return api.post("/upload/images", formData, {
    headers: { "Content-Type": undefined },
  });
};

export const deleteImage = (filename) => {
  return api.delete(`/upload/image/${filename}`);
};

// Edit endpoints
export const cropImage = (data) => {
  return api.post("/edit/crop", data);
};

export const resizeImage = (data) => {
  return api.post("/edit/resize", data);
};

export const rotateImage = (data) => {
  return api.post("/edit/rotate", data);
};

export const applyFilter = (data) => {
  return api.post("/edit/filter", data);
};

export const composeImages = (data) => {
  return api.post("/edit/compose", data);
};

// Template endpoints
export const getTemplates = () => {
  return api.get("/templates");
};

export const getTemplate = (id) => {
  return api.get(`/templates/${id}`);
};

export const getTemplatesByCategory = (category) => {
  return api.get(`/templates/category/${category}`);
};

export const getTemplatesByTheme = (theme) => {
  return api.get(`/templates/theme/${theme}`);
};

export const saveFavorite = (templateId) => {
  return api.post(`/templates/favorite/${templateId}`);
};

export const removeFavorite = (templateId) => {
  return api.delete(`/templates/favorite/${templateId}`);
};

// Download endpoints
export const generatePhotobox = (data) => {
  return api.post("/download/generate", data);
};

export const generateQRCode = (data) => {
  return api.post("/download/qrcode", data);
};

export const downloadFile = (filename) => {
  return `${API_URL}/download/file/${filename}`;
};

// Health check
export const healthCheck = () => {
  return api.get("/health");
};

export default {
  uploadImage,
  uploadImages,
  deleteImage,
  cropImage,
  resizeImage,
  rotateImage,
  applyFilter,
  composeImages,
  getTemplates,
  getTemplate,
  getTemplatesByCategory,
  getTemplatesByTheme,
  saveFavorite,
  removeFavorite,
  generatePhotobox,
  generateQRCode,
  downloadFile,
  healthCheck,
};
