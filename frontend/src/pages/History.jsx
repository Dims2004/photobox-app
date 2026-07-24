import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaDownload, FaTrash, FaClock, FaQrcode } from "react-icons/fa";
import { getHistory, deleteHistoryEntry } from "../utils/historyStorage";
import { formatDate, formatFileSize, downloadFileFromUrl } from "../utils/helpers";
import "../styles/History.css";

const History = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Reads straight from this browser's localStorage - nothing is
    // fetched from the server, so nobody else's results ever show up
    // here.
    setHistory(getHistory());
  }, []);

  const handleDelete = (id) => {
    if (!confirm("Yakin ingin menghapus item ini?")) return;
    setHistory(deleteHistoryEntry(id));
  };

  const handleDownload = (item) => {
    downloadFileFromUrl(item.dataUrl, item.filename);
  };

  return (
    <div className="history-container">
      <div className="history-header">
        <h1 className="history-title">
          <FaClock className="mr-3" />
          Riwayat Foto
        </h1>
        <p className="history-subtitle">
          Riwayat ini tersimpan di browser HP/perangkat kamu sendiri, tidak dibagikan ke siapa pun
        </p>
      </div>

      {history.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📸</div>
          <h3>Belum ada riwayat</h3>
          <p>Mulai buat desain photobox pertamamu</p>
          <Link to="/ambil-foto" className="btn-primary">
            Buat Photobox Baru
          </Link>
        </div>
      ) : (
        <div className="history-grid">
          {history.map((item, index) => (
            <div
              key={item.id}
              className="history-item photo-pop-in"
              style={{ animationDelay: `${Math.min(index, 10) * 55}ms` }}
            >
              <div className="history-item-preview">
                <img src={item.dataUrl} alt={item.filename} loading="lazy" />
                {item.isQR && (
                  <div className="qr-badge">
                    <FaQrcode />
                    QR Code
                  </div>
                )}
              </div>
              <div className="history-item-info">
                <h4 className="history-item-name">
                  {item.filename.replace(/\.[^/.]+$/, "")}
                </h4>
                <div className="history-item-meta">
                  <span>{formatDate(item.createdAt)}</span>
                  <span>•</span>
                  <span>{formatFileSize(item.size)}</span>
                </div>
              </div>
              <div className="history-item-actions">
                <button
                  onClick={() => handleDownload(item)}
                  className="action-btn download-btn"
                  title="Unduh"
                >
                  <FaDownload />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="action-btn delete-btn"
                  title="Hapus"
                >
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

export default History;
