import React from "react";
import { FaTimes } from "react-icons/fa";
import { useEditor } from "../../../hooks/useEditor";
import { LAYOUTS } from "../../../utils/constants";

const PropertiesPanel = ({ onClose }) => {
  const { project, setProject, setLayout } = useEditor();

  return (
    <div className="properties-panel">
      <div className="properties-header">
        <h3>Properti Proyek</h3>
        <button className="modal-close" onClick={onClose} aria-label="Tutup">
          <FaTimes />
        </button>
      </div>

      <div className="properties-body">
        <div className="property-group">
          <label>Nama Proyek</label>
          <input
            type="text"
            value={project.name}
            onChange={(e) => setProject({ name: e.target.value })}
          />
        </div>

        <div className="property-group">
          <label>Warna Latar</label>
          <div className="color-input-row">
            <input
              type="color"
              value={project.backgroundColor}
              onChange={(e) => setProject({ backgroundColor: e.target.value })}
            />
            <span>{project.backgroundColor}</span>
          </div>
        </div>

        <div className="property-group">
          <label>Layout</label>
          <select
            value={project.layout || ""}
            onChange={(e) => setLayout(e.target.value)}
          >
            <option value="">Pilih layout</option>
            {LAYOUTS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        <div className="property-group two-col">
          <div>
            <label>Lebar (px)</label>
            <input
              type="number"
              value={project.width}
              onChange={(e) => setProject({ width: Number(e.target.value) })}
            />
          </div>
          <div>
            <label>Tinggi (px)</label>
            <input
              type="number"
              value={project.height}
              onChange={(e) => setProject({ height: Number(e.target.value) })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;
