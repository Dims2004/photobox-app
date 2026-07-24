import React, { useState } from "react";
import { FaFont, FaTrash, FaPlus } from "react-icons/fa";
import { useEditor } from "../../../hooks/useEditor";

const FONT_OPTIONS = [
  "Poppins, sans-serif",
  "Inter, sans-serif",
  "Georgia, serif",
  "'Courier New', monospace",
  "'Brush Script MT', cursive",
];

const COLOR_OPTIONS = ["#1e293b", "#f43f5e", "#8b5cf6", "#22c55e", "#f59e0b", "#ffffff"];

const TextTab = () => {
  const { textElements, addText, updateText, removeText, project } = useEditor();
  const [draft, setDraft] = useState("Teks Baru");

  const handleAddText = () => {
    if (!draft.trim()) return;
    addText({
      content: draft,
      x: (project.width || 1200) / 2 - 80,
      y: (project.height || 1600) / 2,
    });
    setDraft("Teks Baru");
  };

  return (
    <div className="text-tab">
      <h4>
        <FaFont /> Tambah Teks
      </h4>
      <div className="text-input-row">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Tulis teks di sini..."
          className="text-input"
        />
        <button className="btn-primary btn-sm" onClick={handleAddText}>
          <FaPlus /> Tambah
        </button>
      </div>

      {textElements.length > 0 && (
        <div className="text-elements-list">
          <h4>Teks di Kanvas ({textElements.length})</h4>
          {textElements.map((t) => (
            <div key={t.id} className="text-element-item">
              <input
                type="text"
                value={t.content}
                onChange={(e) => updateText(t.id, { content: e.target.value })}
                className="text-input"
              />

              <div className="text-element-controls">
                <select
                  value={t.fontFamily}
                  onChange={(e) => updateText(t.id, { fontFamily: e.target.value })}
                >
                  {FONT_OPTIONS.map((font) => (
                    <option key={font} value={font} style={{ fontFamily: font }}>
                      {font.split(",")[0].replace(/'/g, "")}
                    </option>
                  ))}
                </select>

                <input
                  type="range"
                  min="12"
                  max="96"
                  value={t.fontSize}
                  onChange={(e) => updateText(t.id, { fontSize: Number(e.target.value) })}
                  title="Ukuran teks"
                />

                <div className="color-swatches">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color}
                      className={`color-swatch ${t.color === color ? "active" : ""}`}
                      style={{ backgroundColor: color }}
                      onClick={() => updateText(t.id, { color })}
                    />
                  ))}
                </div>

                <button className="placed-remove" onClick={() => removeText(t.id)}>
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TextTab;
