import React, { useState } from "react";
import {
  FaImage,
  FaPalette,
  FaEdit,
  FaStickyNote,
  FaFont,
} from "react-icons/fa";
import UploadTab from "./UploadTab";
import TemplateTab from "./TemplateTab";
import EditTab from "./EditTab";
import DecorateTab from "./DecorateTab";
import TextTab from "./TextTab";

const Sidebar = () => {
  const [activeTab, setActiveTab] = useState("upload");

  const tabs = [
    { id: "upload", label: "Upload", icon: FaImage },
    { id: "template", label: "Templates", icon: FaPalette },
    { id: "edit", label: "Edit", icon: FaEdit },
    { id: "decorate", label: "Decorate", icon: FaStickyNote },
    { id: "text", label: "Text", icon: FaFont },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "upload":
        return <UploadTab />;
      case "template":
        return <TemplateTab />;
      case "edit":
        return <EditTab />;
      case "decorate":
        return <DecorateTab />;
      case "text":
        return <TextTab />;
      default:
        return <UploadTab />;
    }
  };

  return (
    <div className="editor-sidebar">
      <div className="sidebar-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`sidebar-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
            title={tab.label}
          >
            <tab.icon />
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>
      <div className="sidebar-content">{renderContent()}</div>
    </div>
  );
};

export default Sidebar;
