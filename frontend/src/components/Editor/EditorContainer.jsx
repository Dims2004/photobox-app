import React from "react";
import Sidebar from "./Sidebar/Sidebar";
import CanvasContainer from "./Canvas/CanvasContainer";

// Convenience wrapper combining the sidebar and canvas. Editor.jsx renders
// these directly today, but this component is available for reuse if the
// editor layout needs to be embedded elsewhere.
const EditorContainer = () => (
  <div className="editor-main">
    <Sidebar />
    <div className="editor-canvas-wrapper">
      <CanvasContainer />
    </div>
  </div>
);

export default EditorContainer;
