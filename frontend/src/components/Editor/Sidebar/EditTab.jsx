import React, { useState } from "react";
import {
  FaCrop,
  FaAdjust,
  FaSyncAlt,
  FaExpand,
  FaCompress,
  FaMagic,
} from "react-icons/fa";
import { useEditor } from "../../../hooks/useEditor";
import { crop as cropImage, filter as applyFilterRequest } from "../../../services/imageService";
import { resolveAssetUrl } from "../../../services/api";

const EditTab = () => {
  const { selectedImage, updateImage } = useEditor();
  const [activeTool, setActiveTool] = useState(null);
  const [busy, setBusy] = useState(false);

  const editTools = [
    { id: "crop", label: "Crop", icon: FaCrop },
    { id: "adjust", label: "Adjust", icon: FaAdjust },
    { id: "rotate", label: "Rotate", icon: FaSyncAlt },
    { id: "zoomIn", label: "Zoom In", icon: FaExpand },
    { id: "zoomOut", label: "Zoom Out", icon: FaCompress },
    { id: "autoFix", label: "Auto Fix", icon: FaMagic },
  ];

  const handleToolSelect = (toolId) => {
    setActiveTool(toolId === activeTool ? null : toolId);
  };

  const handleCrop = async () => {
    if (!selectedImage) return;

    setBusy(true);
    try {
      const result = await cropImage(selectedImage.url, {
        x: 0,
        y: 0,
        width: selectedImage.width || 800,
        height: selectedImage.height || 800,
      });
      if (result.success) {
        updateImage(selectedImage.id, { url: resolveAssetUrl(result.data.url) });
      }
    } catch (error) {
      console.error("Crop failed:", error);
    } finally {
      setBusy(false);
    }
  };

  const handleApplyFilter = async (filterType) => {
    if (!selectedImage) return;

    setBusy(true);
    try {
      const result = await applyFilterRequest(selectedImage.url, filterType);
      if (result.success) {
        updateImage(selectedImage.id, { url: resolveAssetUrl(result.data.url) });
      }
    } catch (error) {
      console.error("Filter failed:", error);
    } finally {
      setBusy(false);
    }
  };

  if (!selectedImage) {
    return (
      <div className="edit-tab empty-state">
        <p className="text-gray-500 text-center">
          Select an image to start editing
        </p>
      </div>
    );
  }

  return (
    <div className="edit-tab">
      <div className="selected-image-preview">
        <img src={selectedImage.url} alt="Selected" />
        <p className="selected-image-name">
          {selectedImage.originalName || "Selected Image"}
        </p>
      </div>

      <div className="edit-tools-grid">
        {editTools.map((tool) => (
          <button
            key={tool.id}
            className={`edit-tool-btn ${activeTool === tool.id ? "active" : ""}`}
            onClick={() => {
              handleToolSelect(tool.id);
              if (tool.id === "crop") handleCrop();
            }}
          >
            <tool.icon />
            <span>{tool.label}</span>
          </button>
        ))}
      </div>

      <div className="filter-presets">
        <h4>Filters</h4>
        <div className="filter-grid">
          {[
            "Original",
            "Vintage",
            "Warm",
            "Cool",
            "Vivid",
            "Sepia",
            "Grayscale",
          ].map((filter) => (
            <button
              key={filter}
              className="filter-btn"
              onClick={() => handleApplyFilter(filter.toLowerCase())}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="adjustment-controls">
        <h4>Adjustments</h4>
        <div className="adjustment-slider">
          <label>Brightness</label>
          <input type="range" min="0" max="200" defaultValue="100" />
        </div>
        <div className="adjustment-slider">
          <label>Contrast</label>
          <input type="range" min="0" max="200" defaultValue="100" />
        </div>
        <div className="adjustment-slider">
          <label>Saturation</label>
          <input type="range" min="0" max="200" defaultValue="100" />
        </div>
      </div>
    </div>
  );
};

export default EditTab;
