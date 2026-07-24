import React from "react";
import { FaPlus, FaMinus, FaExpand } from "react-icons/fa";

// Standalone zoom control bar. CanvasContainer currently renders its own
// inline version, but this is kept as a reusable piece if the canvas is
// ever split into smaller components.
const CanvasControls = ({ zoomLevel, onZoomIn, onZoomOut, onZoomReset }) => (
  <div className="canvas-controls">
    <button onClick={onZoomOut} className="control-btn" aria-label="Perkecil">
      <FaMinus />
    </button>
    <span className="zoom-level">{Math.round(zoomLevel * 100)}%</span>
    <button onClick={onZoomIn} className="control-btn" aria-label="Perbesar">
      <FaPlus />
    </button>
    <button onClick={onZoomReset} className="control-btn" aria-label="Reset zoom">
      <FaExpand />
    </button>
  </div>
);

export default CanvasControls;
