import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEditor } from "../hooks/useEditor";
import Sidebar from "../components/Editor/Sidebar/Sidebar";
import CanvasContainer from "../components/Editor/Canvas/CanvasContainer";
import PropertiesPanel from "../components/Editor/Properties/PropertiesPanel";
import { FaUndo, FaRedo, FaDownload, FaQrcode, FaSlidersH, FaTimes } from "react-icons/fa";
import { addHistoryEntry, urlToDataURL } from "../utils/historyStorage";
import { downloadFile } from "../services/api";
import "../styles/Editor.css";

const Editor = () => {
  const navigate = useNavigate();
  const {
    project,
    history,
    historyIndex,
    undo,
    redo,
    exportProject,
    generateQR,
  } = useEditor();

  const [showProperties, setShowProperties] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [resultFilename, setResultFilename] = useState(null);

  const handleExport = async () => {
    setIsExporting(true);
    setErrorMessage(null);
    try {
      const result = await exportProject();
      if (result.success) {
        setResultUrl(result.data.url);
        setResultFilename(result.data.filename);

        // The backend only holds this file temporarily (free hosting
        // tiers reset their disk regularly), so we pull it down once and
        // keep a private copy in this browser's own history.
        try {
          const dataUrl = await urlToDataURL(result.data.url);
          addHistoryEntry({ filename: result.data.filename, dataUrl });
        } catch (historyError) {
          console.error("Failed to save to local history:", historyError);
        }
      }
    } catch (error) {
      console.error("Export failed:", error);
      setErrorMessage(error?.message || "Gagal membuat photobox. Coba lagi ya.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleGenerateQR = async () => {
    setIsGeneratingQR(true);
    setErrorMessage(null);
    try {
      const result = await generateQR();
      if (result.success) {
        setQrCode(result.data.qrCodeUrl);
      }
    } catch (error) {
      console.error("QR generation failed:", error);
      setErrorMessage(error?.message || "Buat hasil photobox dulu sebelum membuat QR Code.");
    } finally {
      setIsGeneratingQR(false);
    }
  };

  return (
    <div className="editor-container">
      {/* Top Toolbar */}
      <div className="editor-toolbar">
        <div className="toolbar-left">
          <button className="toolbar-btn" onClick={() => navigate("/")}>
            ← <span>Kembali</span>
          </button>
          <div className="toolbar-divider"></div>
          <button
            className="toolbar-btn"
            onClick={undo}
            disabled={historyIndex <= 0}
            title="Undo"
          >
            <FaUndo />
          </button>
          <button
            className="toolbar-btn"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            title="Redo"
          >
            <FaRedo />
          </button>
        </div>
        <div className="toolbar-center">
          <span className="project-name">
            {project?.name || "Proyek Tanpa Judul"}
          </span>
        </div>
        <div className="toolbar-right">
          <button className="toolbar-btn" onClick={handleGenerateQR} disabled={isGeneratingQR}>
            <FaQrcode />
            <span>{isGeneratingQR ? "Membuat..." : "QR Code"}</span>
          </button>
          <button
            className="toolbar-btn btn-primary"
            onClick={handleExport}
            disabled={isExporting}
          >
            <FaDownload />
            <span>{isExporting ? "Mengekspor..." : "Ekspor"}</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="editor-alert">
          {errorMessage}
          <button onClick={() => setErrorMessage(null)}><FaTimes /></button>
        </div>
      )}

      {/* Main Editor Area */}
      <div className="editor-main">
        <Sidebar />

        <div className="editor-canvas-wrapper">
          <CanvasContainer />

          {/* Quick Actions */}
          <div className="quick-actions">
            <button
              className="action-btn"
              onClick={() => setShowProperties(!showProperties)}
            >
              <FaSlidersH />
              Properti
            </button>
          </div>
        </div>

        {showProperties && (
          <PropertiesPanel onClose={() => setShowProperties(false)} />
        )}
      </div>

      {/* Export result modal */}
      {resultUrl && !qrCode && (
        <div className="modal-overlay" onClick={() => setResultUrl(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setResultUrl(null)}>
              ×
            </button>
            <h3>Photobox Berhasil Dibuat 🎉</h3>
            <img src={resultUrl} alt="Hasil Photobox" className="qr-code-image" />
            <a href={downloadFile(resultFilename)} download className="btn-primary" style={{ marginTop: "1rem", display: "inline-flex" }}>
              <FaDownload style={{ marginRight: 8 }} /> Unduh Sekarang
            </a>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {qrCode && (
        <div className="modal-overlay" onClick={() => setQrCode(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setQrCode(null)}>
              ×
            </button>
            <h3>Pindai QR Code untuk Mengunduh</h3>
            <img src={qrCode} alt="QR Code" className="qr-code-image" />
            <p>Pindai dengan kamera HP kamu untuk mengunduh hasil photobox</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Editor;
