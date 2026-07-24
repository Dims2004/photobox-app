import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaEdit,
  FaHistory,
  FaCamera,
  FaUser,
  FaBars,
  FaTimes,
} from "react-icons/fa";

const Navbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { path: "/", label: "Home", icon: FaHome },
    { path: "/ambil-foto", label: "Ambil Foto", icon: FaCamera },
    { path: "/editor", label: "Editor", icon: FaEdit },
    { path: "/history", label: "History", icon: FaHistory },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">📸</span>
          <span className="brand-text">Photobox</span>
        </Link>

        {/* Desktop Navigation */}
        <ul className="navbar-links desktop-nav">
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`nav-link ${isActive(link.path) ? "active" : ""}`}
              >
                <link.icon className="nav-icon" />
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="navbar-actions">
          <button
            className="navbar-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <ul className="navbar-links mobile-nav">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`nav-link ${isActive(link.path) ? "active" : ""}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <link.icon className="nav-icon" />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
