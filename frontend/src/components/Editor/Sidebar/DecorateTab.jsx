import React from "react";
import { FaTrash } from "react-icons/fa";
import { useEditor } from "../../../hooks/useEditor";
import { STICKERS } from "../../../utils/constants";

const DecorateTab = () => {
  const { decorations, addDecoration, removeDecoration, project } = useEditor();

  const handleAddSticker = (sticker) => {
    addDecoration({
      type: "sticker",
      content: sticker,
      x: (project.width || 1200) / 2 - 32,
      y: (project.height || 1600) / 2 - 32,
      size: 64,
    });
  };

  return (
    <div className="decorate-tab">
      <h4>Sticker & Ikon</h4>
      <p className="tab-hint">Pilih sticker untuk mempercantik hasil photobox kamu</p>
      <div className="sticker-grid">
        {STICKERS.map((sticker) => (
          <button
            key={sticker}
            className="sticker-btn"
            onClick={() => handleAddSticker(sticker)}
            title="Tambahkan sticker"
          >
            {sticker}
          </button>
        ))}
      </div>

      {decorations.length > 0 && (
        <div className="placed-decorations">
          <h4>Sticker Terpasang ({decorations.length})</h4>
          <div className="placed-list">
            {decorations.map((d, index) => (
              <div
                key={d.id}
                className="placed-item photo-pop-in"
                style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
              >
                <span className="placed-emoji">{d.content}</span>
                <button
                  className="placed-remove"
                  onClick={() => removeDecoration(d.id)}
                  title="Hapus"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DecorateTab;
