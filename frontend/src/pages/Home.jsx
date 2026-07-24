import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaCamera,
  FaEdit,
  FaDownload,
  FaHeart,
  FaHistory,
  FaMagic,
  FaQrcode,
} from "react-icons/fa";
import { getTemplates } from "../services/api";
import "../styles/Home.css";

const Home = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await getTemplates();
      setTemplates(response.data.slice(0, 6));
    } catch (error) {
      console.error("Failed to fetch templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: FaCamera,
      title: "Upload atau Jepret",
      description: "Unggah dari galeri atau ambil foto langsung dengan kamera",
    },
    {
      icon: FaEdit,
      title: "Edit Mudah",
      description: "Crop, putar, atur, dan percantik fotomu dalam sekejap",
    },
    {
      icon: FaMagic,
      title: "Auto-Fit Pintar",
      description: "Foto otomatis menyesuaikan ukuran frame yang dipilih",
    },
    {
      icon: FaHeart,
      title: "Template Favorit",
      description: "Simpan template favorit untuk dipakai kembali kapan saja",
    },
    {
      icon: FaHistory,
      title: "Riwayat Edit",
      description: "Akses semua hasil karya yang pernah kamu buat",
    },
    {
      icon: FaQrcode,
      title: "Download via QR",
      description: "Pindai QR Code untuk langsung mengunduh ke HP kamu",
    },
  ];

  const templateGradient = (colors = []) =>
    `linear-gradient(135deg, ${colors[0] || "#8b5cf6"}, ${colors[1] || "#f43f5e"})`;

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-badge">✨ Photobox digital tanpa install</span>
          <h1 className="hero-title">
            Buat <span className="text-gradient">Photobox</span> Cantik
            Langsung dari Browser
          </h1>
          <p className="hero-subtitle">
            Desain photobox kece dengan editor online yang mudah dipakai.
            Tanpa install aplikasi, bisa langsung dari HP, tablet, maupun laptop.
          </p>
          <div className="hero-actions">
            <Link to="/ambil-foto" className="btn-primary btn-lg">
              Ambil Foto
              <FaCamera className="ml-2" />
            </Link>
            <Link to="/editor" className="btn-secondary btn-lg">
              Mulai Edit
              <FaEdit className="ml-2" />
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <div className="hero-mockup">
            <div className="hero-mockup-frame frame-1">📷</div>
            <div className="hero-mockup-frame frame-2">🌸</div>
            <div className="hero-mockup-frame frame-3">✨</div>
            <div className="hero-mockup-frame frame-4">💖</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Kenapa Pilih Photobox?</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon-wrap">
                <feature.icon className="feature-icon" />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Templates Preview */}
      <section className="templates-section">
        <h2 className="section-title">Template Populer</h2>
        {loading ? (
          <div className="loading-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="template-skeleton"></div>
            ))}
          </div>
        ) : (
          <div className="templates-grid">
            {templates.map((template, index) => (
              <div
                key={template.id}
                className="template-card photo-pop-in"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <div
                  className="template-preview"
                  style={{ background: templateGradient(template.colors) }}
                >
                  <span className="template-emoji">🖼️</span>
                  <div className="template-overlay">
                    <Link to="/editor" className="btn-primary btn-sm">
                      Pakai Template
                    </Link>
                  </div>
                </div>
                <div className="template-info">
                  <h4>{template.name}</h4>
                  <span className="template-theme">{template.theme}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="text-center mt-8">
          <Link to="/editor" className="btn-primary">
            Lihat Semua Template
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Siap Membuat Photobox Kamu?</h2>
          <p>Mulai desain sekarang dan hidupkan kembali momen berhargamu</p>
          <Link to="/editor" className="btn-primary btn-lg">
            Mulai Gratis
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
