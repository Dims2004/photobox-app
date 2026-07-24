import React, { createContext, useState, useReducer } from "react";
import { v4 as uuidv4 } from "uuid";
import { generatePhotobox, generateQRCode, resolveAssetUrl } from "../services/api";
import { generateFramesForLayout } from "../utils/helpers";

export const EditorContext = createContext();

const initialState = {
  project: {
    id: null,
    name: "Untitled Project",
    width: 1200,
    height: 1600,
    backgroundColor: "#FFFFFF",
    template: null,
    layout: null,
  },
  images: [],
  frames: [],
  decorations: [],
  textElements: [],
  selectedImage: null,
  selectedFrame: null,
  history: [],
  historyIndex: -1,
  favorites: [],
};

const editorReducer = (state, action) => {
  switch (action.type) {
    case "SET_PROJECT":
      return { ...state, project: { ...state.project, ...action.payload } };

    case "ADD_IMAGES": {
      const newImages = action.payload.map((img) => ({
        ...img,
        id: img.id || uuidv4(),
        addedAt: new Date(),
      }));

      // Auto-fit: drop each new image into the next empty frame, if any
      let frameIndex = 0;
      const updatedFrames = state.frames.map((frame) => ({ ...frame }));
      newImages.forEach((img) => {
        while (frameIndex < updatedFrames.length && updatedFrames[frameIndex].image) {
          frameIndex++;
        }
        if (frameIndex < updatedFrames.length) {
          updatedFrames[frameIndex] = { ...updatedFrames[frameIndex], image: img };
          frameIndex++;
        }
      });

      return {
        ...state,
        images: [...state.images, ...newImages],
        frames: updatedFrames,
      };
    }

    case "REMOVE_IMAGE":
      return {
        ...state,
        images: state.images.filter((img) => img.id !== action.payload),
        selectedImage:
          state.selectedImage?.id === action.payload ? null : state.selectedImage,
      };

    case "UPDATE_IMAGE":
      return {
        ...state,
        images: state.images.map((img) =>
          img.id === action.payload.id
            ? { ...img, ...action.payload.updates }
            : img,
        ),
        selectedImage:
          state.selectedImage?.id === action.payload.id
            ? { ...state.selectedImage, ...action.payload.updates }
            : state.selectedImage,
      };

    case "SET_FRAMES":
      return { ...state, frames: action.payload };

    case "UPDATE_FRAME":
      return {
        ...state,
        frames: state.frames.map((frame) =>
          frame.id === action.payload.id
            ? { ...frame, ...action.payload.updates }
            : frame,
        ),
      };

    case "SELECT_IMAGE":
      return { ...state, selectedImage: action.payload };

    case "SELECT_FRAME":
      return { ...state, selectedFrame: action.payload };

    case "SET_TEMPLATE":
      return {
        ...state,
        project: { ...state.project, template: action.payload },
      };

    case "SET_LAYOUT":
      return {
        ...state,
        project: { ...state.project, layout: action.payload },
        frames: generateFramesForLayout(
          action.payload,
          state.project.width,
          state.project.height,
        ),
      };

    case "ADD_DECORATION":
      return {
        ...state,
        decorations: [
          ...state.decorations,
          { id: uuidv4(), x: 100, y: 100, size: 64, rotation: 0, ...action.payload },
        ],
      };

    case "UPDATE_DECORATION":
      return {
        ...state,
        decorations: state.decorations.map((d) =>
          d.id === action.payload.id ? { ...d, ...action.payload.updates } : d,
        ),
      };

    case "REMOVE_DECORATION":
      return {
        ...state,
        decorations: state.decorations.filter((d) => d.id !== action.payload),
      };

    case "ADD_TEXT":
      return {
        ...state,
        textElements: [
          ...state.textElements,
          {
            id: uuidv4(),
            content: "Tulis di sini",
            x: 100,
            y: 100,
            fontSize: 32,
            color: "#1e293b",
            fontFamily: "Poppins, sans-serif",
            ...action.payload,
          },
        ],
      };

    case "UPDATE_TEXT":
      return {
        ...state,
        textElements: state.textElements.map((t) =>
          t.id === action.payload.id ? { ...t, ...action.payload.updates } : t,
        ),
      };

    case "REMOVE_TEXT":
      return {
        ...state,
        textElements: state.textElements.filter((t) => t.id !== action.payload),
      };

    case "ADD_TO_HISTORY":
      return {
        ...state,
        history: [
          ...state.history.slice(0, state.historyIndex + 1),
          action.payload,
        ],
        historyIndex: state.historyIndex + 1,
      };

    case "UNDO":
      if (state.historyIndex > 0) {
        return { ...state, historyIndex: state.historyIndex - 1 };
      }
      return state;

    case "REDO":
      if (state.historyIndex < state.history.length - 1) {
        return { ...state, historyIndex: state.historyIndex + 1 };
      }
      return state;

    case "TOGGLE_FAVORITE": {
      const favIndex = state.favorites.indexOf(action.payload);
      if (favIndex >= 0) {
        return {
          ...state,
          favorites: state.favorites.filter((_, i) => i !== favIndex),
        };
      }
      return { ...state, favorites: [...state.favorites, action.payload] };
    }

    default:
      return state;
  }
};

export const EditorProvider = ({ children }) => {
  const [state, dispatch] = useReducer(editorReducer, initialState);

  const setProject = (updates) => dispatch({ type: "SET_PROJECT", payload: updates });

  const addImages = (images) => dispatch({ type: "ADD_IMAGES", payload: images });

  // Convenience alias so a single uploaded image can be added the same way
  const addImage = (image) => dispatch({ type: "ADD_IMAGES", payload: [image] });

  const removeImage = (imageId) => dispatch({ type: "REMOVE_IMAGE", payload: imageId });

  const updateImage = (imageId, updates) =>
    dispatch({ type: "UPDATE_IMAGE", payload: { id: imageId, updates } });

  const setFrames = (frames) => dispatch({ type: "SET_FRAMES", payload: frames });

  const updateFrame = (frameId, updates) =>
    dispatch({ type: "UPDATE_FRAME", payload: { id: frameId, updates } });

  const selectImage = (image) => dispatch({ type: "SELECT_IMAGE", payload: image });

  const selectFrame = (frame) => dispatch({ type: "SELECT_FRAME", payload: frame });

  const setTemplate = (template) => dispatch({ type: "SET_TEMPLATE", payload: template });

  const setLayout = (layout) => dispatch({ type: "SET_LAYOUT", payload: layout });

  const addDecoration = (decoration) => dispatch({ type: "ADD_DECORATION", payload: decoration });

  const updateDecoration = (id, updates) =>
    dispatch({ type: "UPDATE_DECORATION", payload: { id, updates } });

  const removeDecoration = (id) => dispatch({ type: "REMOVE_DECORATION", payload: id });

  const addText = (text) => dispatch({ type: "ADD_TEXT", payload: text });

  const updateText = (id, updates) => dispatch({ type: "UPDATE_TEXT", payload: { id, updates } });

  const removeText = (id) => dispatch({ type: "REMOVE_TEXT", payload: id });

  const undo = () => dispatch({ type: "UNDO" });

  const redo = () => dispatch({ type: "REDO" });

  const toggleFavorite = (templateId) => dispatch({ type: "TOGGLE_FAVORITE", payload: templateId });

  const exportProject = async () => {
    try {
      const projectData = {
        layout: state.project.layout,
        images: state.images,
        template: state.project.template,
        decorations: state.decorations,
        textElements: state.textElements,
        backgroundColor: state.project.backgroundColor,
        width: state.project.width,
        height: state.project.height,
      };

      const response = await generatePhotobox(projectData);

      if (response.success) {
        const data = { ...response.data, url: resolveAssetUrl(response.data.url) };
        dispatch({
          type: "ADD_TO_HISTORY",
          payload: {
            timestamp: new Date(),
            data,
          },
        });
        return { ...response, data };
      }

      throw new Error("Export failed");
    } catch (error) {
      console.error("Export error:", error);
      throw error;
    }
  };

  const generateQR = async () => {
    try {
      const current = state.history[state.historyIndex];
      if (!current?.data?.filename) {
        throw new Error("Belum ada hasil photobox untuk dibuatkan QR Code");
      }
      const response = await generateQRCode({
        fileUrl: `/results/${current.data.filename}`,
        filename: current.data.filename,
      });
      if (response.success) {
        return {
          ...response,
          data: { ...response.data, qrCodeUrl: resolveAssetUrl(response.data.qrCodeUrl) },
        };
      }
      return response;
    } catch (error) {
      console.error("QR generation error:", error);
      throw error;
    }
  };

  const value = {
    ...state,
    layout: state.project.layout,
    template: state.project.template,
    setProject,
    addImages,
    addImage,
    removeImage,
    updateImage,
    setFrames,
    updateFrame,
    selectImage,
    selectFrame,
    setTemplate,
    setLayout,
    addDecoration,
    updateDecoration,
    removeDecoration,
    addText,
    updateText,
    removeText,
    undo,
    redo,
    toggleFavorite,
    exportProject,
    generateQR,
  };

  return (
    <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
  );
};
